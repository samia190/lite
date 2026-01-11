import { useMemo } from "react";

export default function PerformanceAnalytics({ data = [] }) {
  const analytics = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    // Sort data by year
    const sortedData = [...data].sort((a, b) => parseInt(a.year) - parseInt(b.year));

    // Extract metrics
    const years = sortedData.map(d => d.year);
    const meanGrades = sortedData.map(d => convertGradeToPoints(d.meanGrade));
    const passRates = sortedData.map(d => parseFloat(d.passRate) || 0);
    const topScores = sortedData.map(d => extractTopScore(d.topScore));

    // Calculate trends
    const meanGradeTrend = calculateTrend(meanGrades);
    const passRateTrend = calculateTrend(passRates);
    const topScoreTrend = calculateTrend(topScores);

    // Calculate statistics
    const avgMeanGrade = meanGrades.reduce((a, b) => a + b, 0) / meanGrades.length;
    const avgPassRate = passRates.reduce((a, b) => a + b, 0) / passRates.length;
    const avgTopScore = topScores.reduce((a, b) => a + b, 0) / topScores.length;

    // Find best and worst years
    const bestYearByGrade = sortedData[meanGrades.indexOf(Math.max(...meanGrades))];
    const bestYearByPassRate = sortedData[passRates.indexOf(Math.max(...passRates))];

    // Calculate year-over-year changes
    const yoyChanges = sortedData.slice(1).map((current, index) => {
      const previous = sortedData[index];
      const gradeChange = convertGradeToPoints(current.meanGrade) - convertGradeToPoints(previous.meanGrade);
      const passRateChange = (parseFloat(current.passRate) || 0) - (parseFloat(previous.passRate) || 0);
      return {
        year: current.year,
        previousYear: previous.year,
        gradeChange,
        passRateChange,
        gradeImproved: gradeChange > 0,
        passRateImproved: passRateChange > 0
      };
    });

    return {
      sortedData,
      years,
      meanGrades,
      passRates,
      topScores,
      meanGradeTrend,
      passRateTrend,
      topScoreTrend,
      avgMeanGrade,
      avgPassRate,
      avgTopScore,
      bestYearByGrade,
      bestYearByPassRate,
      yoyChanges,
      totalYears: sortedData.length
    };
  }, [data]);

  if (!analytics) {
    return (
      <div style={{
        textAlign: "center",
        padding: "40px",
        background: "#f9fafb",
        borderRadius: "12px",
        color: "#6b7280"
      }}>
        <p style={{ fontSize: "16px", margin: 0 }}>
          No data available for analysis. Add performance records to see trends and insights.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Key Insights Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}>
        {/* Overall Trend Card */}
        <div style={{
          background: getTrendColor(analytics.meanGradeTrend).bg,
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          border: `2px solid ${getTrendColor(analytics.meanGradeTrend).border}`
        }}>
          <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px", fontWeight: "600" }}>
            Overall Performance Trend
          </div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: getTrendColor(analytics.meanGradeTrend).text, marginBottom: "8px" }}>
            {analytics.meanGradeTrend > 0 ? "↗" : analytics.meanGradeTrend < 0 ? "↘" : "→"}
          </div>
          <div style={{ fontSize: "13px", color: "#4b5563" }}>
            {analytics.meanGradeTrend > 0 
              ? "Improving consistently" 
              : analytics.meanGradeTrend < 0 
              ? "Declining trend" 
              : "Stable performance"}
          </div>
        </div>

        {/* Best Year Card */}
        <div style={{
          background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)",
          color: "white"
        }}>
          <div style={{ fontSize: "14px", marginBottom: "8px", fontWeight: "600", opacity: 0.9 }}>
            Best Performance Year
          </div>
          <div style={{ fontSize: "32px", fontWeight: "700", marginBottom: "4px" }}>
            {analytics.bestYearByGrade.year}
          </div>
          <div style={{ fontSize: "13px", opacity: 0.9 }}>
            Mean Grade: {analytics.bestYearByGrade.meanGrade}
          </div>
        </div>

        {/* Average Performance Card */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
          color: "white"
        }}>
          <div style={{ fontSize: "14px", marginBottom: "8px", fontWeight: "600", opacity: 0.9 }}>
            Average Pass Rate
          </div>
          <div style={{ fontSize: "32px", fontWeight: "700", marginBottom: "4px" }}>
            {analytics.avgPassRate.toFixed(1)}%
          </div>
          <div style={{ fontSize: "13px", opacity: 0.9 }}>
            Across {analytics.totalYears} years
          </div>
        </div>

        {/* Pass Rate Trend Card */}
        <div style={{
          background: getTrendColor(analytics.passRateTrend).bg,
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          border: `2px solid ${getTrendColor(analytics.passRateTrend).border}`
        }}>
          <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px", fontWeight: "600" }}>
            Pass Rate Trend
          </div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: getTrendColor(analytics.passRateTrend).text, marginBottom: "8px" }}>
            {analytics.passRateTrend > 0 ? "↗" : analytics.passRateTrend < 0 ? "↘" : "→"}
          </div>
          <div style={{ fontSize: "13px", color: "#4b5563" }}>
            {analytics.passRateTrend > 0 
              ? "Increasing pass rates" 
              : analytics.passRateTrend < 0 
              ? "Declining pass rates" 
              : "Stable pass rates"}
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "25px",
        marginBottom: "30px"
      }}>
        {/* Mean Grade Chart */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "25px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <h4 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#1f2937", fontWeight: "700" }}>
            📈 Mean Grade Progression
          </h4>
          <div style={{ position: "relative", height: "200px" }}>
            {renderChart(analytics.years, analytics.meanGrades, "#667eea", convertPointsToGrade)}
          </div>
        </div>

        {/* Pass Rate Chart */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "25px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <h4 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#1f2937", fontWeight: "700" }}>
            📊 Pass Rate Progression
          </h4>
          <div style={{ position: "relative", height: "200px" }}>
            {renderChart(analytics.years, analytics.passRates, "#10b981", (val) => `${val.toFixed(1)}%`)}
          </div>
        </div>

        {/* Top Score Chart */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "25px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <h4 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#1f2937", fontWeight: "700" }}>
            🏆 Top Score Progression
          </h4>
          <div style={{ position: "relative", height: "200px" }}>
            {renderChart(analytics.years, analytics.topScores, "#f59e0b", (val) => `${val} pts`)}
          </div>
        </div>
      </div>

      {/* Year-over-Year Analysis */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "25px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <h4 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "#1f2937", fontWeight: "700" }}>
          📅 Year-over-Year Performance Analysis
        </h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "700", color: "#374151" }}>
                  Period
                </th>
                <th style={{ padding: "12px", textAlign: "center", fontSize: "13px", fontWeight: "700", color: "#374151" }}>
                  Mean Grade Change
                </th>
                <th style={{ padding: "12px", textAlign: "center", fontSize: "13px", fontWeight: "700", color: "#374151" }}>
                  Pass Rate Change
                </th>
                <th style={{ padding: "12px", textAlign: "center", fontSize: "13px", fontWeight: "700", color: "#374151" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.yoyChanges.map((change, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px", fontSize: "14px", color: "#1f2937" }}>
                    {change.previousYear} → {change.year}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: change.gradeImproved ? "#d1fae5" : change.gradeChange < 0 ? "#fee2e2" : "#f3f4f6",
                      color: change.gradeImproved ? "#065f46" : change.gradeChange < 0 ? "#991b1b" : "#6b7280"
                    }}>
                      {change.gradeImproved ? "+" : ""}{change.gradeChange.toFixed(1)} pts
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: change.passRateImproved ? "#d1fae5" : change.passRateChange < 0 ? "#fee2e2" : "#f3f4f6",
                      color: change.passRateImproved ? "#065f46" : change.passRateChange < 0 ? "#991b1b" : "#6b7280"
                    }}>
                      {change.passRateImproved ? "+" : ""}{change.passRateChange.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center", fontSize: "20px" }}>
                    {change.gradeImproved && change.passRateImproved ? "🎉" : 
                     change.gradeImproved || change.passRateImproved ? "📈" : "📉"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div style={{
        background: "linear-gradient(135deg, #e0e7ff 0%, #fce7f3 100%)",
        borderRadius: "12px",
        padding: "25px",
        marginTop: "25px",
        border: "2px solid #c7d2fe"
      }}>
        <h4 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#1f2937", fontWeight: "700" }}>
          💡 Key Insights
        </h4>
        <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "1.8", color: "#374151" }}>
          <li>
            The school has maintained an average pass rate of <strong>{analytics.avgPassRate.toFixed(1)}%</strong> over the past {analytics.totalYears} years.
          </li>
          <li>
            Best performance was recorded in <strong>{analytics.bestYearByGrade.year}</strong> with a mean grade of <strong>{analytics.bestYearByGrade.meanGrade}</strong>.
          </li>
          <li>
            Highest pass rate achieved: <strong>{analytics.bestYearByPassRate.passRate}</strong> in <strong>{analytics.bestYearByPassRate.year}</strong>.
          </li>
          <li>
            Overall trend shows {analytics.meanGradeTrend > 0 ? "an improving" : analytics.meanGradeTrend < 0 ? "a declining" : "a stable"} pattern in mean grades.
          </li>
          {analytics.yoyChanges.filter(c => c.gradeImproved && c.passRateImproved).length > 0 && (
            <li>
              <strong>{analytics.yoyChanges.filter(c => c.gradeImproved && c.passRateImproved).length}</strong> years showed improvement in both mean grade and pass rate.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// Helper Functions
function convertGradeToPoints(grade) {
  const gradePoints = {
    "A": 12, "A-": 11,
    "B+": 10, "B": 9, "B-": 8,
    "C+": 7, "C": 6, "C-": 5,
    "D+": 4, "D": 3, "D-": 2,
    "E": 1
  };
  return gradePoints[grade?.toUpperCase()?.trim()] || 0;
}

function convertPointsToGrade(points) {
  const pointsToGrade = {
    12: "A", 11: "A-",
    10: "B+", 9: "B", 8: "B-",
    7: "C+", 6: "C", 5: "C-",
    4: "D+", 3: "D", 2: "D-",
    1: "E", 0: "E"
  };
  return pointsToGrade[Math.round(points)] || "E";
}

function extractTopScore(topScoreStr) {
  const match = topScoreStr?.match(/\((\d+)\s*points?\)/i);
  return match ? parseInt(match[1]) : 0;
}

function calculateTrend(values) {
  if (values.length < 2) return 0;
  
  // Simple linear regression slope
  const n = values.length;
  const sumX = values.reduce((sum, _, i) => sum + i, 0);
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
  const sumX2 = values.reduce((sum, _, i) => sum + (i * i), 0);
  
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

function getTrendColor(trend) {
  if (trend > 0.1) {
    return { bg: "#d1fae5", border: "#10b981", text: "#065f46" };
  } else if (trend < -0.1) {
    return { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" };
  } else {
    return { bg: "#e0e7ff", border: "#6366f1", text: "#3730a3" };
  }
}

function renderChart(labels, values, color, formatter = (v) => v) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: "100%", gap: "8px" }}>
      {values.map((value, index) => {
        const heightPercent = ((value - min) / range) * 80 + 10; // 10% minimum height
        return (
          <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: "100%",
              height: `${heightPercent}%`,
              background: `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)`,
              borderRadius: "8px 8px 0 0",
              position: "relative",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingTop: "8px",
              transition: "all 0.3s ease",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scaleY(1.05)";
              e.currentTarget.style.filter = "brightness(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scaleY(1)";
              e.currentTarget.style.filter = "brightness(1)";
            }}
            title={formatter(value)}
            >
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#1f2937" }}>
                {formatter(value)}
              </span>
            </div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", marginTop: "8px" }}>
              {labels[index]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
