import React from "react";

export default function TransportRequestStatus({ busPass, setPage }) {
  if (!busPass) {
    return (
      <>
        <p className="small-heading">STUDENT PORTAL</p>
        <h1>Transport Request Status</h1>

        <div className="panel">
          <h2>No transport request found</h2>
          <p className="muted">
            You have not submitted a transport request yet.
          </p>

          <button className="primary-small" onClick={() => setPage("apply")}>
            Select Pickup Point & Apply
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="small-heading">STUDENT PORTAL</p>
      <h1>Transport Request Status</h1>
      <p className="muted">
        Track the approval progress of your transport request.
      </p>

      <div className="panel">
        <div className="request-status-header">
          <div>
            <h2>Request Details</h2>
            <p className="muted">
              Application ID: {busPass.applicationId}
            </p>
          </div>

          <span
            className={
              busPass.status === "Approved"
                ? "attendance-status present"
                : "attendance-status pending"
            }
          >
            {busPass.status}
          </span>
        </div>

        <p><strong>Pickup Point:</strong> {busPass.pickupStop}</p>
        <p><strong>Term Duration:</strong> {busPass.termDuration}</p>

        {busPass.status === "Pending" && (
          <div className="status-message pending-message">
            Your request has been submitted successfully and is waiting for
            admin approval.
          </div>
        )}

        {busPass.status === "Approved" && (
          <div className="status-message approved-message">
            Your request is approved. Your assigned bus and route are now
            available.
          </div>
        )}
      </div>
    </>
  );
}