import numpy as np
import pandas as pd


def get_temp_col(base: str) -> str:
    # Kept for compatibility with older call sites if needed.
    return f"{base}_{np.random.randint(1_000_000_000)}"


def remove_outlier_by_IQR(dataframe, columns, factor=1.5):
    """
    Remove rows where any selected column value lies outside IQR bounds.
    """
    if not columns:
        return dataframe

    working = dataframe.copy()
    mask = pd.Series([True] * len(working), index=working.index)

    for column in columns:
        if column not in working.columns:
            continue

        series = pd.to_numeric(working[column], errors="coerce")
        if series.dropna().empty:
            continue

        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        if pd.isna(iqr) or iqr == 0:
            continue

        lower = q1 - factor * iqr
        upper = q3 + factor * iqr
        valid = series.between(lower, upper) | series.isna()
        mask &= valid

    return working.loc[mask].reset_index(drop=True)


def normalize_column(df, column_name, method):
    """
    Normalize a single numeric column using supported pandas/scikit-learn friendly methods.
    """
    series = pd.to_numeric(df[column_name], errors="coerce")
    if series.isna().all():
        return df

    output = df.copy()
    if method == "Min-Max":
        min_val = series.min()
        max_val = series.max()
        output[column_name] = 0.0 if max_val == min_val else (series - min_val) / (
            max_val - min_val
        )
    elif method == "Z-score":
        std = series.std()
        if pd.isna(std) or std == 0:
            output[column_name] = 0.0
        else:
            output[column_name] = (series - series.mean()) / std
    elif method == "L1 Norm":
        denom = series.abs().sum()
        output[column_name] = series / denom if denom != 0 else 0.0
    elif method == "L2 Norm":
        denom = np.sqrt((series ** 2).sum())
        output[column_name] = series / denom if denom != 0 else 0.0
    elif method == "L inf Norm":
        denom = series.abs().max()
        output[column_name] = series / denom if denom != 0 else 0.0
    else:
        print(f"Unsupported normalization method: {method} for {column_name}")
        return df

    output[column_name] = output[column_name].where(~series.isna(), np.nan)
    return output


def All_Column_Operations(df, step, numericCols, allCols):
    operation = step["operation"]
    all_columns = list(allCols)
    numeric_columns = [column for column in numericCols if column in df.columns]

    if operation == "Drop Null":
        return df.dropna(subset=all_columns).reset_index(drop=True)

    if operation == "Fill 0 Unknown False":
        result = df.copy()
        for column in all_columns:
            if column not in result.columns:
                continue
            if pd.api.types.is_numeric_dtype(result[column]):
                result[column] = result[column].fillna(0)
            elif pd.api.types.is_bool_dtype(result[column]):
                result[column] = result[column].fillna(False)
            else:
                result[column] = result[column].fillna("unknown")
        return result

    if operation == "Fill Mean":
        result = df.copy()
        for column in numeric_columns:
            result[column] = pd.to_numeric(result[column], errors="coerce").astype(float).fillna(
                pd.to_numeric(result[column], errors="coerce").mean()
            )
        return result

    if operation == "Fill Median":
        result = df.copy()
        for column in numeric_columns:
            result[column] = pd.to_numeric(result[column], errors="coerce").astype(float).fillna(
                pd.to_numeric(result[column], errors="coerce").median()
            )
        return result

    if operation == "Drop Duplicates":
        return df.drop_duplicates().reset_index(drop=True)

    if operation in [
        "L1 Norm",
        "L2 Norm",
        "L inf Norm",
        "Min-Max",
        "Z-score",
    ]:
        result = df.copy()
        for column in numeric_columns:
            result = normalize_column(result, column, operation)
        return result

    if operation == "Remove Outliers":
        return remove_outlier_by_IQR(df, numeric_columns)

    print(
        f"error: Operation not defined in All_Column_Operations function for {step['column']} column: {operation} \n"
    )
    return df


def Column_Operations(df, step):
    column = step["column"]
    operation = step["operation"]

    if column not in df.columns:
        return df

    if operation == "Drop Null":
        return df.dropna(subset=[column]).reset_index(drop=True)

    if operation == "Drop Duplicates":
        return df.drop_duplicates(subset=[column]).reset_index(drop=True)

    if operation == "Drop Column":
        return df.drop(columns=[column]).reset_index(drop=True)

    if operation == "Fill 0":
        return df.copy().fillna({column: 0})

    if operation == "Fill Unknown":
        return df.copy().fillna({column: "Unknown"})

    if operation == "Fill False":
        return df.copy().fillna({column: False})

    if operation == "Fill mean":
        result = df.copy()
        result[column] = pd.to_numeric(result[column], errors="coerce").astype(float).fillna(
            pd.to_numeric(result[column], errors="coerce").mean()
        )
        return result

    if operation == "Fill Median":
        result = df.copy()
        result[column] = pd.to_numeric(result[column], errors="coerce").astype(float).fillna(
            pd.to_numeric(result[column], errors="coerce").median()
        )
        return result

    if operation == "Fill Mode":
        result = df.copy()
        mode = result[column].mode(dropna=True)
        if not mode.empty:
            result[column] = result[column].fillna(mode.iloc[0])
        return result

    if operation in [
        "L1 Norm",
        "L2 Norm",
        "L inf Norm",
        "Min-Max",
        "Z-score",
    ]:
        return normalize_column(df, column, operation)

    if operation == "Remove Outliers":
        return remove_outlier_by_IQR(df, [column])

    if operation == "Log":
        result = df.copy()
        numeric = pd.to_numeric(result[column], errors="coerce")
        result[column] = numeric.apply(lambda value: np.log(value) if pd.notna(value) and value > 0 else np.nan)
        return result

    if operation == "Square":
        result = df.copy()
        result[column] = pd.to_numeric(result[column], errors="coerce") ** 2
        return result

    if operation == "Square Root":
        result = df.copy()
        result[column] = np.sqrt(pd.to_numeric(result[column], errors="coerce").clip(lower=0))
        return result

    if operation == "Label Encoding":
        if df[column].isna().any():
            print(f"error: Null values found in {column} column for Label Encoding")
            return df
        result = df.copy()
        result[column], _ = pd.factorize(result[column].astype(str), sort=True)
        return result

    if operation == "One Hot Encoding":
        if df[column].isna().any():
            print(f"error: Null values found in {column} column for One Hot Encoding")
            return df
        result = df.copy()
        dummies = pd.get_dummies(result[column], prefix=column)
        result = result.drop(columns=[column]).reset_index(drop=True)
        return pd.concat([result, dummies.reset_index(drop=True)], axis=1)

    print(
        f"error: Operation not defined in Column_Operations function for {step['column']} column: {operation} \n"
    )
    return df
