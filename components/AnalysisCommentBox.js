export default function AnalysisCommentBox({
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div className="analysis-comment">
      <div className="analysis-label">Comment</div>
      <textarea
        className="analysis-textarea"
        rows={3}
        value={value}
        disabled={disabled}
        placeholder="Add a comment..."
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
