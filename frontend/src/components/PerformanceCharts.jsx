// components/PerformanceCharts.jsx
// Performance Visualization Charts for Student Results

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart
} from 'recharts';

// Color palette
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  warning: '#ff9800',
  danger: '#f44336',
  info: '#2196F3',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2'
};

const GRADE_COLORS = {
  A: '#4CAF50',
  B: '#8BC34A',
  C: '#FFEB3B',
  D: '#FF9800',
  E: '#f44336'
};

/**
 * Progress Over Terms Chart (Line Chart)
 * Shows average marks trend over multiple terms
 */
export const ProgressChart = ({ termAverages }) => {
  if (!termAverages || termAverages.length < 2) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Need at least 2 terms of data to show progress chart
      </div>
    );
  }

  const data = termAverages.map(t => ({
    name: `${t.term?.replace('Term ', 'T') || 'T?'} ${t.year}`,
    average: t.average || 0,
    fullName: `${t.term} ${t.year}`
  }));

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <Tooltip 
            formatter={(value) => [`${value?.toFixed(1)}%`, 'Average']}
            labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
            contentStyle={{ 
              background: 'white', 
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="average" 
            stroke={COLORS.primary}
            strokeWidth={3}
            fill="url(#colorAvg)"
            dot={{ r: 5, fill: COLORS.primary }}
            activeDot={{ r: 7 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Subject Comparison Radar Chart
 * Shows performance across subjects as a radar/spider chart
 */
export const SubjectRadarChart = ({ subjects }) => {
  if (!subjects || subjects.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No subject data available
      </div>
    );
  }

  // Limit to 8 subjects for readability
  const data = subjects.slice(0, 8).map(s => ({
    subject: s.subjectName?.substring(0, 10) || 'Unknown',
    marks: s.marks || 0,
    fullName: s.subjectName
  }));

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="#ddd" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: 11, fill: '#666' }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
          />
          <Radar
            name="Marks"
            dataKey="marks"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.5}
          />
          <Tooltip 
            formatter={(value, name, props) => [`${value}%`, props.payload.fullName]}
            contentStyle={{ 
              background: 'white', 
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Subject Trends Bar Chart
 * Compare same subject across multiple terms
 */
export const SubjectTrendsChart = ({ subjectAnalysis }) => {
  if (!subjectAnalysis || subjectAnalysis.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No subject trend data available
      </div>
    );
  }

  const data = subjectAnalysis.slice(0, 8).map(s => ({
    subject: s.subjectName?.substring(0, 8) || 'Unknown',
    best: s.bestMark || 0,
    worst: s.worstMark || 0,
    average: s.averageOverTime || 0,
    change: s.changeFromPrevious || 0,
    trend: s.trend,
    fullName: s.subjectName
  }));

  const getTrendColor = (trend) => {
    if (trend === 'improving') return COLORS.success;
    if (trend === 'declining') return COLORS.danger;
    if (trend === 'fluctuating') return COLORS.warning;
    return COLORS.info;
  };

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis 
            dataKey="subject" 
            tick={{ fontSize: 11 }}
            stroke="#666"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            stroke="#666"
          />
          <Tooltip 
            formatter={(value, name) => [`${value}%`, name]}
            labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
            contentStyle={{ 
              background: 'white', 
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar dataKey="average" name="Average" fill={COLORS.primary} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getTrendColor(entry.trend)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Current Term Subject Breakdown
 */
export const CurrentSubjectsChart = ({ subjects }) => {
  if (!subjects || subjects.length === 0) {
    return null;
  }

  const data = subjects.map(s => ({
    subject: s.subjectName?.substring(0, 12) || 'Unknown',
    marks: s.marks || 0,
    grade: s.grade || 'N/A',
    fullName: s.subjectName
  })).sort((a, b) => b.marks - a.marks);

  const getBarColor = (marks) => {
    if (marks >= 75) return COLORS.success;
    if (marks >= 60) return '#8BC34A';
    if (marks >= 50) return COLORS.warning;
    if (marks >= 40) return '#FF9800';
    return COLORS.danger;
  };

  return (
    <div style={{ width: '100%', height: Math.max(250, subjects.length * 35) }}>
      <ResponsiveContainer>
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ top: 10, right: 50, left: 80, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
          <XAxis 
            type="number" 
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            stroke="#666"
          />
          <YAxis 
            type="category" 
            dataKey="subject"
            tick={{ fontSize: 11 }}
            stroke="#666"
            width={75}
          />
          <Tooltip 
            formatter={(value, name, props) => [
              `${value}% (Grade: ${props.payload.grade})`, 
              props.payload.fullName
            ]}
            contentStyle={{ 
              background: 'white', 
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="marks" name="Marks" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.marks)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Risk Level Indicator
 */
export const RiskIndicator = ({ riskLevel, riskFactors }) => {
  const getConfig = () => {
    switch (riskLevel) {
      case 'high':
        return {
          color: COLORS.danger,
          bgColor: '#ffebee',
          borderColor: '#ffcdd2',
          icon: '🚨',
          text: 'High Risk'
        };
      case 'medium':
        return {
          color: COLORS.warning,
          bgColor: '#fff3e0',
          borderColor: '#ffe0b2',
          icon: '⚠️',
          text: 'Medium Risk'
        };
      case 'low':
      default:
        return {
          color: COLORS.success,
          bgColor: '#e8f5e9',
          borderColor: '#c8e6c9',
          icon: '✅',
          text: 'Low Risk'
        };
    }
  };

  const config = getConfig();

  return (
    <div style={{
      padding: '15px',
      background: config.bgColor,
      border: `1px solid ${config.borderColor}`,
      borderRadius: '10px',
      marginBottom: '15px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        marginBottom: riskFactors?.length > 0 ? '10px' : 0
      }}>
        <span style={{ fontSize: '24px' }}>{config.icon}</span>
        <div>
          <div style={{ fontWeight: '600', color: config.color, fontSize: '16px' }}>
            {config.text}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Academic Performance Status
          </div>
        </div>
      </div>
      
      {riskFactors && riskFactors.length > 0 && (
        <ul style={{ 
          margin: '10px 0 0 0', 
          padding: '0 0 0 20px',
          fontSize: '13px',
          color: '#555'
        }}>
          {riskFactors.map((factor, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>{factor}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Trend Badge Component
 */
export const TrendBadge = ({ trend, size = 'medium' }) => {
  const getConfig = () => {
    switch (trend) {
      case 'improving':
        return { icon: '📈', color: COLORS.success, text: 'Improving' };
      case 'declining':
        return { icon: '📉', color: COLORS.danger, text: 'Declining' };
      case 'stable':
        return { icon: '➡️', color: COLORS.info, text: 'Stable' };
      case 'fluctuating':
        return { icon: '📊', color: COLORS.warning, text: 'Fluctuating' };
      default:
        return { icon: '📋', color: '#666', text: 'First Term' };
    }
  };

  const config = getConfig();
  const fontSize = size === 'large' ? '16px' : size === 'small' ? '11px' : '13px';
  const padding = size === 'large' ? '8px 16px' : size === 'small' ? '3px 8px' : '5px 12px';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: `${config.color}15`,
      color: config.color,
      padding: padding,
      borderRadius: '16px',
      fontSize: fontSize,
      fontWeight: '600'
    }}>
      <span>{config.icon}</span>
      {config.text}
    </span>
  );
};

/**
 * Prediction Display
 */
export const PredictionCard = ({ currentAverage, projectedAverage }) => {
  if (!projectedAverage) return null;

  const change = projectedAverage - (currentAverage || 0);
  const isPositive = change >= 0;

  return (
    <div style={{
      padding: '15px',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
      border: '1px solid #bbdefb',
      borderRadius: '10px',
      marginBottom: '15px'
    }}>
      <div style={{ 
        fontSize: '12px', 
        color: '#666', 
        marginBottom: '5px',
        fontWeight: '600'
      }}>
        🔮 Projected Next Term
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'baseline', 
        gap: '10px' 
      }}>
        <span style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: COLORS.primary 
        }}>
          {projectedAverage.toFixed(1)}%
        </span>
        <span style={{
          fontSize: '14px',
          color: isPositive ? COLORS.success : COLORS.danger,
          fontWeight: '600'
        }}>
          {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      <div style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>
        Based on historical performance trends
      </div>
    </div>
  );
};

/**
 * Recommendations Card
 */
export const RecommendationsCard = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) return null;

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'urgent':
        return { color: COLORS.danger, bg: '#ffebee', icon: '🚨' };
      case 'high':
        return { color: '#e65100', bg: '#fff3e0', icon: '⚠️' };
      case 'medium':
        return { color: COLORS.info, bg: '#e3f2fd', icon: '💡' };
      case 'low':
      default:
        return { color: COLORS.success, bg: '#e8f5e9', icon: '✅' };
    }
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 16px',
        fontWeight: '600',
        fontSize: '15px'
      }}>
        📋 Smart Recommendations
      </div>
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        {recommendations.map((rec, idx) => {
          const config = getPriorityConfig(rec.priority);
          return (
            <div 
              key={idx}
              style={{
                padding: '15px',
                borderBottom: idx < recommendations.length - 1 ? '1px solid #f0f0f0' : 'none',
                background: config.bg
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span>{config.icon}</span>
                <span style={{ 
                  fontWeight: '600', 
                  color: config.color,
                  fontSize: '14px'
                }}>
                  {rec.title}
                </span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: config.color,
                  color: 'white',
                  textTransform: 'uppercase'
                }}>
                  {rec.priority}
                </span>
              </div>
              {rec.detail && (
                <p style={{ 
                  margin: '0 0 10px 0', 
                  fontSize: '13px', 
                  color: '#555' 
                }}>
                  {rec.detail}
                </p>
              )}
              {rec.actions && rec.actions.length > 0 && (
                <ul style={{ 
                  margin: 0, 
                  padding: '0 0 0 18px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {rec.actions.map((action, actionIdx) => (
                    <li key={actionIdx} style={{ marginBottom: '3px' }}>{action}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Complete Performance Dashboard
 */
export const PerformanceDashboard = ({ result, showDetailed = true }) => {
  if (!result) return null;

  const hasHistory = result.historicalAnalysis?.termCount > 1;
  const hasSubjects = result.subjects && result.subjects.length > 0;

  return (
    <div>
      {/* Risk Indicator */}
      {result.riskLevel && result.riskLevel !== 'low' && (
        <RiskIndicator 
          riskLevel={result.riskLevel} 
          riskFactors={result.riskFactors} 
        />
      )}

      {/* Overall Trend */}
      {hasHistory && result.historicalAnalysis?.overallTrend && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Overall Trend ({result.historicalAnalysis.termCount} terms)
            </div>
            <TrendBadge trend={result.historicalAnalysis.overallTrend} size="large" />
          </div>
          
          {result.projectedNextTermAverage && (
            <PredictionCard 
              currentAverage={result.averageMarks}
              projectedAverage={result.projectedNextTermAverage}
            />
          )}
        </div>
      )}

      {/* Progress Chart */}
      {hasHistory && result.historicalAnalysis?.termAverages && (
        <div style={{
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
            📈 Progress Over Time
          </h4>
          <ProgressChart termAverages={result.historicalAnalysis.termAverages} />
        </div>
      )}

      {/* Subject Analysis - Grid */}
      {showDetailed && hasSubjects && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Current Subjects */}
          <div style={{
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
              📊 Subject Performance
            </h4>
            <CurrentSubjectsChart subjects={result.subjects} />
          </div>

          {/* Radar Chart */}
          <div style={{
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
              🎯 Strength Map
            </h4>
            <SubjectRadarChart subjects={result.subjects} />
          </div>
        </div>
      )}

      {/* Subject Trends (if available) */}
      {showDetailed && result.subjectAnalysis && result.subjectAnalysis.length > 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
            📚 Subject Trends Over Time
          </h4>
          <SubjectTrendsChart subjectAnalysis={result.subjectAnalysis} />
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            marginTop: '15px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', background: COLORS.success, borderRadius: '2px' }} />
              <span style={{ fontSize: '12px', color: '#666' }}>Improving</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', background: COLORS.danger, borderRadius: '2px' }} />
              <span style={{ fontSize: '12px', color: '#666' }}>Declining</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', background: COLORS.warning, borderRadius: '2px' }} />
              <span style={{ fontSize: '12px', color: '#666' }}>Fluctuating</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', background: COLORS.info, borderRadius: '2px' }} />
              <span style={{ fontSize: '12px', color: '#666' }}>Stable</span>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showDetailed && result.recommendations && result.recommendations.length > 0 && (
        <RecommendationsCard recommendations={result.recommendations} />
      )}
    </div>
  );
};

export default {
  ProgressChart,
  SubjectRadarChart,
  SubjectTrendsChart,
  CurrentSubjectsChart,
  RiskIndicator,
  TrendBadge,
  PredictionCard,
  RecommendationsCard,
  PerformanceDashboard
};
