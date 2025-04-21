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
load_dotenv()


# Start from the current script's file location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
print("SCRIPT_Working_DIR",SCRIPT_DIR)

# Go three directories up
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
BASE_URL = os.getenv("API_BASE_URL")


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
    else:
        return params

def get_model_config(session_id: int):
    db: Session = next(get_db())
    try:
        record = db.query(CurrentTrainings).filter_by(session_id=session_id).first()
        if not record:
            raise ValueError(f"No training config found for session_id {session_id}")
        return record.training_details
    finally:
        db.close()

def receive_global_parameters(url,session_id,client_token):
    try:
        response = requests.get(url+"/"+session_id)
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
            "Content-Type": "application/json"         # Specify the payload format
        }
        print("Payload : ", type(payload["client_parameter"]))
        response = requests.post(url, json=payload, headers=headers)
        # Debug output
        print("Status Code:", response.status_code)
        print("Response Text:", response.text)
        
        response.raise_for_status()  # Raise an HTTPError for bad responses
        print("Response.json() - ", response.json())  # Assuming the response is in JSON format
    except requests.exceptions.RequestException as e:
        print(f"Error posting data to {url}: {e}")


def compare_parameters(before, after):
    all_same = True
    for layer_idx, (b_layer, a_layer) in enumerate(zip(before["weights"], after["weights"])):
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
    config = {
        "optimizer": None,
        "learning_rate": None,
        "loss": None,
        "layers": []
    }

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

def main(session_id, client_token):
    try:
        # ==== HARDCODED CONFIGURATION ====
        # BASE_URL = "http://host.docker.internal:8000"

        print("Starting training script...")
        get_url = f"{BASE_URL}/get-model-parameters"
        post_url = f"{BASE_URL}/receive-client-parameters"
        
        model_config = get_model_config(session_id)
        

        # ==== Load model ====
        model = model_instance_from_config(model_config)
        if model is None:
            raise ValueError("Model creation returned None")
        print("Model built successfully")
        
        # Save Model Config
        filename = "model_config.txt"
        print_model_config(model.model,filename)

        X_path = os.path.join("data", f"X_{session_id}.npy")
        Y_path = os.path.join("data", f"Y_{session_id}.npy")
        
        # Load data
        X = np.load(X_path)
        Y = np.load(Y_path)
        

        # ==== Load and update global parameters ====
        global_parameters = receive_global_parameters(get_url, session_id, client_token)
        print("Checkpoint isFirst : ", global_parameters["is_first"])
        if global_parameters and global_parameters['is_first'] == 0:
            print("Checkpint global_parameters: ", len)
            model.update_parameters(global_parameters['global_parameters'])

        # ==== Save current local parameters ====
        with open("local_parameters.txt", "a", encoding="utf-8") as f:
            f.write("\n---\n")
            f.write(json.dumps(model.get_parameters()))
            f.write("\n")
         

        print("Local parameters saved to local_parameters.txt")
        before_training = model.get_parameters()
        
        print(f"X dtype: {X.dtype}, Y dtype: {Y.dtype}")
        
        # ==== Train ====
        model.fit(X, Y)
        
        after_training = model.get_parameters()  
        compare_parameters(before_training, after_training)
        

        # Save updated parameters after training
        with open("updated_parameters.txt", "a", encoding="utf-8") as f:
            f.write("\n--- Updated Parameters After Training ---\n")
            f.write(json.dumps(model.get_parameters()))
            f.write("\n")
        # ==== Send updated parameters ====
        updated_parameters = model.get_parameters()
        payload = {
            "session_id": int(session_id),
            "client_parameter": sanitize_parameters(updated_parameters)
        }

        send_updated_parameters(post_url, payload, client_token)
        print("Parameters sent to server")

    except Exception as e:
        print(f"Error from training_script: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--session_id", required=True, help="Session ID")
    parser.add_argument("--client_token", required=True, help="Client Token")  
    args = parser.parse_args()

    main(args.session_id, args.client_token)

