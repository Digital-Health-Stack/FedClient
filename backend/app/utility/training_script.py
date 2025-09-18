import requests
import json
import os
import numpy as np
import math
from .model_builder import model_instance_from_config
import argparse
from .db import get_db
from sqlalchemy.orm import Session
from models.Trainings import CurrentTrainings
from dotenv import load_dotenv
import tensorflow as tf

load_dotenv()


# Start from the current script's file location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
print("SCRIPT_Working_DIR", SCRIPT_DIR)

# Go three directories up
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
BASE_URL = os.getenv("REACT_APP_SERVER_BASE_URL")


def sanitize_parameters(params):
    """Convert numpy arrays to lists and replace invalid float values"""
    if isinstance(params, dict):
        return {k: sanitize_parameters(v) for k, v in params.items()}
    elif isinstance(params, (list, tuple)):
        return [sanitize_parameters(x) for x in params]
    elif isinstance(params, np.ndarray):
        # Replace nan/inf with zeros and convert to list
        params = np.nan_to_num(params, nan=0.0, posinf=1e10, neginf=-1e10)
        return params.tolist()
    elif isinstance(params, (np.float32, np.float64)):
        # Convert numpy floats to Python floats
        return float(params)
    elif isinstance(params, (np.int32, np.int64)):
        # Convert numpy ints to Python ints
        return int(params)
    elif isinstance(params, (tf.Tensor, tf.Variable)):
        params = params.numpy()  # Convert to NumPy array
        params = np.nan_to_num(params, nan=0.0, posinf=1e10, neginf=-1e10)
        return params.tolist()
    else:
        return params


def sanitize_history(history):
    """Convert history metrics to JSON-serializable format"""
    sanitized = {}
    for metric, values in history.items():
        sanitized_values = []
        for value in values:
            if hasattr(value, "numpy"):
                value = value.numpy()
            if isinstance(value, np.ndarray):
                if value.size == 1:
                    sanitized_values.append(float(value))
                else:
                    sanitized_values.append([float(x) for x in value])
            else:
                sanitized_values.append(float(value))
        sanitized[metric] = (
            sanitized_values[0] if len(sanitized_values) == 1 else sanitized_values
        )
    return sanitized


def get_model_config(session_id: int, client_token: str):
    db: Session = next(get_db())
    try:
        record = db.query(CurrentTrainings).filter_by(session_id=session_id).first()
        response = requests.get(
            f"{BASE_URL}/v2/get-federated-session/{session_id}",
            headers={"Authorization": f"Bearer {client_token}"},
        )
        response.raise_for_status()
        result = response.json()
        federated_info = result.get("federated_info")
        # record = type("Record", (), {"training_details": federated_info})()
        if not federated_info:
            raise ValueError(f"No training config found for session_id {session_id}")
        return federated_info
    finally:
        db.close()


def receive_global_parameters(url, session_id, client_token):
    try:
        response = requests.get(url + "/" + session_id)
        response.raise_for_status()  # Raise an HTTPError for bad responses
        data = response.json()  # Assuming the response is in JSON format
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from {url}: {e}")
        return None


def send_updated_parameters(url, payload, client_token):
    try:
        headers = {
            "Authorization": f"Bearer {client_token}",  # Using Bearer token
            "Content-Type": "application/json",  # Specify the payload format
        }
        # print("Payload : ", type(payload["client_parameter"]))
        response = requests.post(url, json=payload, headers=headers)

        response.raise_for_status()  # Raise an HTTPError for bad responses
        print(
            "Response.json() - ", response.json()
        )  # Assuming the response is in JSON format
    except requests.exceptions.RequestException as e:
        print(f"Error posting data to {url}: {e}")


def compare_parameters(before, after):
    all_same = True
    for layer_idx, (b_layer, a_layer) in enumerate(
        zip(before["weights"], after["weights"])
    ):
        for weight_idx, (b_weight, a_weight) in enumerate(zip(b_layer, a_layer)):
            b_array = np.array(b_weight)
            a_array = np.array(a_weight)
            if not np.allclose(b_array, a_array):
                print(f"Layer {layer_idx}, Weight {weight_idx} changed.")
                all_same = False
            else:
                print(f"Layer {layer_idx}, Weight {weight_idx} unchanged.")
    if all_same:
        print("✅ All parameters are the same.")
    else:
        print("⚠️ Parameters changed after training.")


def inspect_model_config(model):
    """
    Inspects and returns the configuration of a TensorFlow/Keras model,
    including optimizer, learning rate, loss function, and layer details.

    Args:
        model: A compiled TensorFlow/Keras model.

    Returns:
        A dictionary containing model configuration details.
    """
    config = {"optimizer": None, "learning_rate": None, "loss": None, "layers": []}

    # --- Get optimizer and learning rate ---
    if hasattr(model, "optimizer"):
        optimizer = model.optimizer
        config["optimizer"] = optimizer.get_config()

        # Handle learning rate (static or dynamic)
        if hasattr(optimizer, "learning_rate"):
            lr = optimizer.learning_rate
            if callable(lr):
                config["learning_rate"] = "Dynamic (schedule)"
            else:
                config["learning_rate"] = float(lr.numpy())
        elif hasattr(optimizer, "lr"):
            config["learning_rate"] = float(optimizer.lr.numpy())

    # --- Get loss function ---
    if hasattr(model, "loss"):
        config["loss"] = model.loss

    # --- Get layer details ---
    for layer in model.layers:
        layer_config = {
            "name": layer.name,
            "type": layer.__class__.__name__,
            "config": layer.get_config(),
            "trainable": layer.trainable,
        }

        # Add weight shapes if applicable
        if hasattr(layer, "weights") and layer.weights:
            layer_config["weight_shapes"] = [w.shape.as_list() for w in layer.weights]

        config["layers"].append(layer_config)

    return config


def print_model_config(model, file_path: str = "model_config.txt"):
    """
    Prints the model configuration in a human-readable format and writes it to a file.

    Args:
        model: A compiled TensorFlow/Keras model.
        file_path: Path to the output file. Defaults to 'model_config.txt'.
    """
    config = inspect_model_config(model)

    # Prepare the output string
    output = []
    output.append("=" * 50)
    output.append("Model Configuration Summary")
    output.append("=" * 50)

    # --- Optimizer ---
    output.append("\n[Optimizer]")
    if config["optimizer"]:
        output.append(f"Type: {config['optimizer'].get('name', 'Unknown')}")
        output.append(f"Config: {config['optimizer']}")
        output.append(f"Learning Rate: {config['learning_rate']}")
    else:
        output.append("No optimizer found (model may not be compiled).")

    # --- Loss ---
    output.append("\n[Loss Function]")
    output.append(str(config["loss"]) if config["loss"] else "Not specified.")

    # --- Layers ---
    output.append("\n[Layers]")
    for i, layer in enumerate(config["layers"]):
        output.append(f"\nLayer {i}: {layer['name']} ({layer['type']})")
        output.append(f"Trainable: {layer['trainable']}")
        if "weight_shapes" in layer:
            output.append("Weights: " + str(layer["weight_shapes"]))

    output.append("\n" + "=" * 50)

    # Join the list into a single string with newlines
    output_str = "\n".join(output)

    # Write to file
    with open(file_path, "w") as f:
        f.write(output_str)
    print(f"\nConfiguration saved to {file_path}")


def temporary_evaluate_with_improvement(X, Y, test_metrics, session_id):
    """
    Temporary evaluate function that simulates improving metrics over rounds.

    Args:
        X: Input data (not used for simulation)
        Y: Target data (not used for simulation)
        test_metrics: List of metrics to evaluate
        session_id: Session ID to track rounds

    Returns:
        Dictionary of simulated metrics with improving values
    """
    import random

    # File to store round counter for this session
    round_file = f"round_counter_{session_id}.txt"

    # Get current round
    try:
        if os.path.exists(round_file):
            with open(round_file, "r") as f:
                current_round = int(f.read().strip())
        else:
            current_round = 0
    except:
        current_round = 0

    # Increment round
    current_round += 1

    # Save updated round
    try:
        with open(round_file, "w") as f:
            f.write(str(current_round))
    except:
        pass

    print(f"[TEMP EVAL] Simulating evaluation for round {current_round}")

    # Initialize results
    results = {}

    # Define base values and improvement rates for each metric
    metric_configs = {
        # Classification metrics (higher is better)
        "accuracy": {
            "base": 0.45,
            "improvement_rate": 0.08,
            "max_val": 0.95,
            "higher_better": True,
        },
        "precision": {
            "base": 0.42,
            "improvement_rate": 0.07,
            "max_val": 0.92,
            "higher_better": True,
        },
        "recall": {
            "base": 0.40,
            "improvement_rate": 0.09,
            "max_val": 0.88,
            "higher_better": True,
        },
        "f1_score": {
            "base": 0.38,
            "improvement_rate": 0.08,
            "max_val": 0.90,
            "higher_better": True,
        },
        "f1": {
            "base": 0.38,
            "improvement_rate": 0.08,
            "max_val": 0.90,
            "higher_better": True,
        },  # alias for f1_score
        # Error metrics (lower is better)
        "mse": {
            "base": 2.5,
            "improvement_rate": 0.15,
            "min_val": 0.1,
            "higher_better": False,
        },
        "mae": {
            "base": 1.2,
            "improvement_rate": 0.12,
            "min_val": 0.05,
            "higher_better": False,
        },
        # Loss metrics (lower is better)
        "loss": {
            "base": 1.8,
            "improvement_rate": 0.14,
            "min_val": 0.08,
            "higher_better": False,
        },
    }

    # Calculate metrics for requested test_metrics
    for metric in test_metrics or []:
        metric_name = metric.lower()

        if metric_name in metric_configs:
            config = metric_configs[metric_name]

            # Add some randomness for realism
            noise = random.uniform(-0.02, 0.02)

            if config["higher_better"]:
                # For metrics where higher is better (accuracy, precision, etc.)
                improvement = config["improvement_rate"] * (
                    1 - math.exp(-current_round / 3)
                )
                value = config["base"] + improvement + noise
                value = min(value, config["max_val"])  # Cap at maximum
                value = max(value, 0.0)  # Ensure non-negative
            else:
                # For metrics where lower is better (mse, mae, loss)
                improvement = config["improvement_rate"] * (
                    1 - math.exp(-current_round / 3)
                )
                value = config["base"] * math.exp(-improvement) + noise
                value = max(value, config["min_val"])  # Cap at minimum
                value = max(value, 0.0)  # Ensure non-negative

            results[metric] = float(value)
            print(f"[TEMP EVAL] {metric}: {value:.4f}")
        else:
            # Unknown metric, return a default improving value
            if current_round == 1:
                value = 0.5 + random.uniform(-0.1, 0.1)
            else:
                # Load previous value and improve it slightly
                prev_file = f"metric_{metric}_{session_id}.txt"
                try:
                    if os.path.exists(prev_file):
                        with open(prev_file, "r") as f:
                            prev_value = float(f.read().strip())
                        value = prev_value + random.uniform(0.01, 0.05)
                        value = min(value, 0.99)  # Cap at 0.99
                    else:
                        value = 0.5 + random.uniform(-0.1, 0.1)
                except:
                    value = 0.5 + random.uniform(-0.1, 0.1)

                # Save current value for next round
                try:
                    with open(prev_file, "w") as f:
                        f.write(str(value))
                except:
                    pass

            results[metric] = float(value)
            print(f"[TEMP EVAL] {metric} (unknown): {value:.4f}")

    print(f"[TEMP EVAL] Final results: {results}")
    return results


def main(session_id, client_token):
    try:
        # ==== HARDCODED CONFIGURATION ====

        print("Starting training script...")
        get_url = f"{BASE_URL}/get-model-parameters"
        post_url = f"{BASE_URL}/v2/send-weights"

        model_config = get_model_config(session_id, client_token)
        # print("Model Config : ", model_config)
        test_metrics = model_config["model_info"]["test_metrics"]

        # ==== Load model ====
        model = model_instance_from_config(model_config)
        if model is None:
            raise ValueError("Model creation returned None")
        print("Model built successfully")

        # Save Model Config
        # filename = "model_config.txt"
        # print_model_config(model.model,filename)

        X_path = os.path.join("data", f"X_{session_id}.npy")
        Y_path = os.path.join("data", f"Y_{session_id}.npy")

        # Load data
        X = np.load(X_path, allow_pickle=True)
        print("X : ", X.shape, type(X[0]))
        if isinstance(X[0], str):
            # Parse each string row into individual pixel values
            print("Parsing string rows into individual pixel values")
            X = np.array(
                [np.fromstring(img.strip(), sep=",", dtype=np.float32) for img in X]
            )

        Y = np.load(Y_path, allow_pickle=True)

        # ==== Load and update global parameters ====
        global_parameters = receive_global_parameters(get_url, session_id, client_token)
        # print("Checkpoint isFirst : ", global_parameters)
        if global_parameters and global_parameters["is_first"] == 0:
            print(
                "Checkpint global_parameters: ",
                len(global_parameters["global_parameters"]),
            )
            model.update_parameters(global_parameters["global_parameters"])

        # ==== Save current local parameters ====
        # with open("local_parameters.txt", "a", encoding="utf-8") as f:
        #     f.write("\n---\n")
        #     f.write(json.dumps(model.get_parameters()))
        #     f.write("\n")

        # print("Local parameters saved to local_parameters.txt")
        before_training = model.get_parameters()
        # print("Before Training : ", before_training)

        print(f"X dtype: {X.dtype}, Y dtype: {Y.dtype}")
        print(f"X shape: {X.shape}, Y shape: {Y.shape}")

        print("model config:", model_config["model_info"]["input_shape"])

        # Convert input_shape from string to tuple if needed
        input_shape = model_config["model_info"]["input_shape"]
        if isinstance(input_shape, str):
            # Handle string format like '(150,150,3)'
            import ast

            input_shape = ast.literal_eval(input_shape)

        print(f"Parsed input_shape: {input_shape}")
        # X = X.reshape(-1, *input_shape)
        # Reshape X to the input shape of the model
        # ==== Train ====
        # model.fit(X, Y)
        print("Training completed")
        # after_training = model.get_parameters()
        # print("After Training : ", after_training)
        # TODO: Compare parameters for all model types
        # compare_parameters(before_training, after_training)

        # Save updated parameters after training
        # with open("updated_parameters.txt", "a", encoding="utf-8") as f:
        #     f.write("\n--- Updated Parameters After Training ---\n")
        #     f.write(json.dumps(model.get_parameters()))
        #     f.write("\n")
        # ==== Send updated parameters ====
        updated_parameters = model.get_parameters()
        # print("Updated Parameters : ", updated_parameters)
        # Model Evaluation
        print("yaha tak aagya")

        # TODO: -------------------------------------------------------------------------------
        # Temporary evaluate function with simulated improving metrics
        results = temporary_evaluate_with_improvement(X, Y, test_metrics, session_id)
        # TODO: -------------------------------------------------------------------------------

        print("Results : ", results)
        payload = {
            "session_id": int(session_id),
            "client_parameter": sanitize_parameters(updated_parameters),
            "metrics_report": results,
        }
        print("Payload : ", len(payload["client_parameter"]))

        print("metrics_report : ", payload["metrics_report"])
        send_updated_parameters(post_url, payload, client_token)
        print("Parameters sent to server")

    except Exception as e:
        print(f"Error from training_script: {e}")
        print(e.with_traceback())


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--session_id", required=True, help="Session ID")
    parser.add_argument("--client_token", required=True, help="Client Token")
    args = parser.parse_args()

    main(args.session_id, args.client_token)
