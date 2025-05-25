export default function ProgressSteps({ steps }) {
  const activeIndex = steps.findIndex((step) => step.status === "active");

  return (
    <div className="progress-container">
      <div className="progress-line" />

      <div
        className="progress-line-active"
        style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
      />

      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className={`step step${index}`}>
            <div
              className={`step-indicator ${
                step.status === "active"
                  ? "step-active"
                  : step.status === "completed"
                  ? "step-completed"
                  : "step-pending"
              }`}
            />
            <span className="step-label">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
