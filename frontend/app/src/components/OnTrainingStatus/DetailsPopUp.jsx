import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";

// export default function DetailsPopUp({ selectedDetails, handleClose }) {
//   // console.log(selectedDetails);
//   return <div></div>;
// }
/* Not complete some edge cases are still remaining...next update soon */
export default function DetailsPopUp({ selectedDetails, handleClose }) {
  // console.log(selectedDetails);
  return (
    <div
      className="modal fade show"
      id="detailsModal"
      tabIndex="-1"
      aria-labelledby="detailsModalLabel"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <div className="modal-dialog modal-dialog-scrollable modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="detailsModalLabel">
              Details
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">
            <h6>Model Details:</h6>
            {selectedDetails.model ? (
              <ul className="list-group">
                {Object.entries(selectedDetails.model).map(
                  ([modelName, params]) => (
                    <li key={modelName} className="list-group-item">
                      <strong>{modelName}:</strong>
                      <ul>
                        {Object.entries(params).map(([key, value]) => (
                          <li key={key}>
                            <strong>{key}: </strong>
                            {value}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>No model details available.</p>
            )}
            <h6>Data Details:</h6>
            {selectedDetails.data ? (
              <ul className="list-group">
                {Object.entries(selectedDetails.data).map(([key, value]) => (
                  <li key={key} className="list-group-item">
                    <strong>{key}: </strong>
                    {value}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No data details available.</p>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
