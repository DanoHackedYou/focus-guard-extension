type ScoreCardProps = {
  productiveMinutes: number;
  dailyGoalMinutes: number;
};

export function ScoreCard({ productiveMinutes, dailyGoalMinutes }: ScoreCardProps) {
  const progress = Math.min(100, Math.round((productiveMinutes / dailyGoalMinutes) * 100));

  return (
    <section className="score-card">
      <span>Daily Focus Progress</span>
      <strong>{progress}%</strong>
      <p>{productiveMinutes} of {dailyGoalMinutes} minutes</p>
      <div className="progress"><div style={{ width: `${progress}%` }} /></div>
    </section>
  );
}
