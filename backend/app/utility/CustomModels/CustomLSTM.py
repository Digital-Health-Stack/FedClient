import tensorflow as tf
from tensorflow.keras import models, layers, regularizers, optimizers
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Input,
    Dense,
    LSTM,
    Bidirectional,
    Dropout,
    BatchNormalization,
    TimeDistributed,
    GlobalMaxPooling1D,
    GlobalAveragePooling1D,
    Masking,
    Embedding,
)
import numpy as np
import ast
from tensorflow.keras import metrics


class BinaryF1Score(metrics.Metric):
    def __init__(self, name="f1_score", threshold=0.5, **kwargs):
        super().__init__(name=name, **kwargs)
        self.threshold = threshold
        self.precision = metrics.Precision(thresholds=threshold)
        self.recall = metrics.Recall(thresholds=threshold)

    def update_state(self, y_true, y_pred, sample_weight=None):
        self.precision.update_state(y_true, y_pred)
        self.recall.update_state(y_true, y_pred)

    def result(self):
        p = self.precision.result()
        r = self.recall.result()
        return 2 * ((p * r) / (p + r + tf.keras.backend.epsilon()))

    def reset_state(self):
        self.precision.reset_state()
        self.recall.reset_state()


def get_metric_mapping():
    """Returns all available metrics without validation"""
    return {
        # Universal metrics (work for any task)
        "mae": "mae",
        "mse": "mse",
        "accuracy": "accuracy",
        # Classification metrics
        "precision": metrics.Precision(name="precision"),
        "recall": metrics.Recall(name="recall"),
        "f1_score": BinaryF1Score(name="f1_score"),
    }


def resolve_metrics(metric_names):
    """Simple metric name to implementation mapping"""
    mapping = get_metric_mapping()
    return [mapping[name] for name in metric_names if name in mapping]


def handle_error(error):
    error_message = f"An error occurred: {error}"
    print(error_message)


class CustomLSTM:
    def __init__(self, config):
        self.config = config
        self.model = Sequential()
        try:
            input_shape = ast.literal_eval(config.get("input_shape", "(None, 128)"))
            self.model.add(Input(shape=input_shape))

            # Adding layers to the model
            for i in range(len(config["layers"])):
                layer = config["layers"][i]
                layer_type = layer["layer_type"]

                if layer_type == "dense":
                    dense_layer = Dense(
                        int(layer["num_nodes"]),
                        activation=layer.get("activation_function", "relu"),
                    )
                    # Add regularization if specified
                    if "regularizer" in layer:
                        reg_config = layer["regularizer"]
                        if reg_config["type"] == "l2":
                            dense_layer.kernel_regularizer = regularizers.l2(
                                float(reg_config["factor"])
                            )
                    self.model.add(dense_layer)

                elif layer_type == "lstm":
                    lstm_layer = LSTM(
                        int(layer["units"]),
                        activation=layer.get("activation_function", "tanh"),
                        recurrent_activation=layer.get(
                            "recurrent_activation", "sigmoid"
                        ),
                        return_sequences=layer.get("return_sequences", False),
                        dropout=float(layer.get("dropout", 0.0)),
                        recurrent_dropout=float(layer.get("recurrent_dropout", 0.0)),
                    )
                    # Add regularization if specified
                    if "regularizer" in layer:
                        reg_config = layer["regularizer"]
                        if reg_config["type"] == "l2":
                            lstm_layer.kernel_regularizer = regularizers.l2(
                                float(reg_config["factor"])
                            )
                            lstm_layer.recurrent_regularizer = regularizers.l2(
                                float(reg_config["factor"])
                            )
                    self.model.add(lstm_layer)

                elif layer_type == "bidirectional_lstm":
                    lstm_layer = LSTM(
                        int(layer["units"]),
                        activation=layer.get("activation_function", "tanh"),
                        recurrent_activation=layer.get(
                            "recurrent_activation", "sigmoid"
                        ),
                        return_sequences=layer.get("return_sequences", False),
                        dropout=float(layer.get("dropout", 0.0)),
                        recurrent_dropout=float(layer.get("recurrent_dropout", 0.0)),
                    )
                    # Add regularization if specified
                    if "regularizer" in layer:
                        reg_config = layer["regularizer"]
                        if reg_config["type"] == "l2":
                            lstm_layer.kernel_regularizer = regularizers.l2(
                                float(reg_config["factor"])
                            )
                            lstm_layer.recurrent_regularizer = regularizers.l2(
                                float(reg_config["factor"])
                            )

                    bidirectional_layer = Bidirectional(lstm_layer)
                    self.model.add(bidirectional_layer)

                elif layer_type == "embedding":
                    embedding_layer = Embedding(
                        input_dim=int(layer["input_dim"]),
                        output_dim=int(layer["output_dim"]),
                        input_length=layer.get("input_length", None),
                        mask_zero=layer.get("mask_zero", False),
                    )
                    self.model.add(embedding_layer)

                elif layer_type == "masking":
                    self.model.add(Masking(mask_value=layer.get("mask_value", 0.0)))

                elif layer_type == "time_distributed":
                    dense_layer = Dense(
                        int(layer["num_nodes"]),
                        activation=layer.get("activation_function", "relu"),
                    )
                    time_distributed_layer = TimeDistributed(dense_layer)
                    self.model.add(time_distributed_layer)

                elif layer_type == "global_max_pooling":
                    self.model.add(GlobalMaxPooling1D())

                elif layer_type == "global_average_pooling":
                    self.model.add(GlobalAveragePooling1D())

                elif layer_type == "batch_norm":
                    self.model.add(BatchNormalization())

                elif layer_type == "dropout":
                    self.model.add(Dropout(float(layer.get("rate", 0.5))))

            # Output layer
            output_layer = config["output_layer"]
            output_dense = Dense(
                int(output_layer["num_nodes"]),
                activation=output_layer.get("activation_function", "linear"),
            )
            if "regularizer" in output_layer:
                reg_config = output_layer["regularizer"]
                if reg_config["type"] == "l2":
                    output_dense.kernel_regularizer = regularizers.l2(
                        float(reg_config["factor"])
                    )
            self.model.add(output_dense)

            # Compile model
            optimizer_config = config.get(
                "optimizer", {"type": "adam", "learning_rate": 0.001}
            )
            if optimizer_config["type"] == "adam":
                optimizer = optimizers.Adam(
                    learning_rate=float(optimizer_config.get("learning_rate", 0.001))
                )
            elif optimizer_config["type"] == "sgd":
                optimizer = optimizers.SGD(
                    learning_rate=float(optimizer_config.get("learning_rate", 0.01))
                )
            else:
                optimizer = optimizer_config["type"]  # assume it's a string like 'adam'

            metrics = resolve_metrics(config.get("test_metrics", []))
            self.model.compile(
                loss=config.get("loss", "mean_squared_error"),
                optimizer=optimizer,
                metrics=metrics,
            )

        except Exception as e:
            handle_error(e)

    def fit(self, X, y, epochs=1, batch_size=32, validation_data=None, callbacks=None):
        try:
            # Input validation
            if X is None or y is None:
                print("Error: X and y cannot be None")
                return None

            # Check model compilation
            if not hasattr(self.model, "optimizer"):
                print("Error: Model is not compiled")
                return None
            return self.model.fit(
                X,
                y,
                epochs=epochs,
                batch_size=batch_size,
                validation_data=validation_data,
                callbacks=callbacks,
                verbose=0,
            )
        except Exception as e:
            error_message = f"An error occurred in Fit Function: {e}"
            print(error_message)

    def predict(self, X):
        try:
            return self.model.predict(X)
        except Exception as e:
            handle_error(e)

    def get_parameters(self):
        try:
            params = {"weights": []}
            for i, layer in enumerate(self.model.layers):
                layer_weights = layer.get_weights()
                # Convert each weight array to lists (can't do at once.)
                params["weights"].append([w.tolist() for w in layer_weights])
            return params
        except Exception as e:
            handle_error(e)

    def update_parameters(self, new_params):
        try:
            for i, (layer, layer_params) in enumerate(
                zip(self.model.layers, new_params["weights"])
            ):
                # Convert lists back to numpy arrays
                layer.set_weights([np.array(w) for w in layer_params])
        except Exception as e:
            handle_error(e)

    def evaluate(self, x_test, y_test, batch_size=32):
        try:
            if x_test is None or y_test is None:
                print("Error: x_test and y_test cannot be None")
                return None

            results = self.model.evaluate(x_test, y_test, batch_size=batch_size)
            # Return a dictionary of metric names and their values
            metrics = ["loss"] + self.config.get("test_metrics", [])
            return dict(zip(metrics, results))
        except Exception as e:
            error_message = f"An error occurred in Evaluate Function: {e}"
            print(error_message)
