import React from 'react';
import { Link } from 'react-router-dom';

function EvaluationEndScreen() {
  return (
    <div className="EndScreen">
      <div className="EndScreen__thankYou">
        Thank you for participating.
      </div>
      <Link
        to="/evaluation"
        className="Evaluation__buttonbar__button"
      >
        Back to Evaluation
      </Link>
    </div>
  );
}

export default EvaluationEndScreen;
