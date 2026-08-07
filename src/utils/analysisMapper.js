import { formatDateLabel, formatTime } from './formatters';

const normalizeRiskLevel = (riskLevel = '') => {
  const value = String(riskLevel).toLowerCase();
  if (value.includes('critical') || value.includes('high')) return 'high';
  if (value.includes('medium') || value.includes('moderate')) return 'medium';
  return 'low';
};

const pickEither = (obj, camelKey, snakeKey, fallback = undefined) => {
  if (obj == null) return fallback;
  const camel = obj[camelKey];
  const snake = obj[snakeKey];
  if (camel !== undefined && camel !== null) return camel;
  if (snake !== undefined && snake !== null) return snake;
  return fallback;
};

export const normalizeAnalysis = (data = {}) => {
  const aiProbability = Math.round(
    pickEither(data, 'aiProbability', 'ai_voice_probability', 0),
  );
  const scamIntent = Math.round(
    pickEither(data, 'scamIntentScore', 'scam_intent_score', 0),
  );
  const unifiedRisk = Math.round(
    pickEither(data, 'unifiedRiskScore', 'unified_risk_score', 0),
  );
  const authenticityScore = Math.max(0, Math.round(100 - aiProbability));

  const flaggedKeywords =
    pickEither(data, 'flaggedKeywords', 'flagged_keywords') || [];
  const riskEvents = flaggedKeywords.map((keyword, index) => ({
    id: `kw-${index}`,
    time: '--:--',
    label: keyword,
    type: unifiedRisk >= 70 ? 'danger' : 'warning',
  }));

  const transcriptText = pickEither(data, 'transcript', 'transcript', '') || '';
  const existingLines = pickEither(data, 'transcriptLines', null);
  const transcriptLines =
    Array.isArray(existingLines) && existingLines.length
      ? existingLines
      : transcriptText
          ? transcriptText
              .split('\n')
              .filter(Boolean)
              .map((line, index) => ({
                id: `line-${index}`,
                time: '--:--',
                text: line.trim(),
              }))
          : [];

  const reasoning = pickEither(data, 'reasoning', 'reasoning', '') || '';
  const riskLevelRaw = pickEither(data, 'riskLevelLabel', 'risk_level', 'LOW RISK');
  const createdAt =
    pickEither(data, 'createdAt', 'created_at') || new Date().toISOString();

  return {
    id: pickEither(data, 'id', 'id', null),
    fileName: pickEither(data, 'fileName', 'file_name', ''),
    callerNumber: pickEither(data, 'callerNumber', 'caller_number', ''),
    transcript: transcriptText,
    transcriptLines,
    aiProbability,
    scamIntentScore: scamIntent,
    unifiedRiskScore: unifiedRisk,
    authenticityScore,
    confidence: Math.round(pickEither(data, 'confidence', 'confidence', unifiedRisk)),
    riskLevel: normalizeRiskLevel(riskLevelRaw),
    riskLevelLabel: String(riskLevelRaw || 'LOW RISK'),
    scamCategory: pickEither(data, 'scamCategory', 'scam_category', '') || '',
    flaggedKeywords,
    reasoning,
    analysisReasons: reasoning ? [reasoning] : [],
    riskEvents:
      Array.isArray(data.riskEvents) && data.riskEvents.length
        ? data.riskEvents
        : riskEvents,
    createdAt,
  };
};

export const mapAnalysisResponse = (data = {}) => normalizeAnalysis(data);

export const mapHistoryItem = (item = {}) => {
  const mapped = mapAnalysisResponse(item);
  const createdAtRaw =
    pickEither(item, 'createdAt', 'created_at') || new Date().toISOString();
  const createdAt = new Date(createdAtRaw);
  const callerNum = pickEither(item, 'callerNumber', 'caller_number', '') || '';

  let filterCategory = pickEither(item, 'filterCategory', null);
  if (!filterCategory) {
    filterCategory = 'Human';
    if (mapped.aiProbability > 60) filterCategory = 'AI';
    else if (mapped.aiProbability > 30 || mapped.unifiedRiskScore > 50) {
      filterCategory = 'Suspicious';
    }
  }

  const badge =
    pickEither(item, 'badge', null) ||
    (mapped.aiProbability > 60
      ? 'AI'
      : mapped.aiProbability > 30
        ? 'Suspicious'
        : 'Human');
  const badgeColor =
    pickEither(item, 'badgeColor', null) ||
    (mapped.aiProbability > 60
      ? '#EF4444'
      : mapped.aiProbability > 30
        ? '#F59E0B'
        : '#22C55E');

  return {
    ...mapped,
    id: pickEither(item, 'id', 'id', mapped.id),
    number: pickEither(item, 'number', null, callerNum) || callerNum,
    name: pickEither(item, 'name', null, callerNum || 'Unknown Caller') || callerNum || 'Unknown Caller',
    initials:
      pickEither(item, 'initials', null) ||
      (callerNum || 'UC').replace(/\D/g, '').slice(-2) ||
      'UC',
    time: pickEither(item, 'time', null, formatTime(createdAt)) || formatTime(createdAt),
    dateLabel:
      pickEither(item, 'dateLabel', null, formatDateLabel(createdAt)) ||
      formatDateLabel(createdAt),
    group:
      pickEither(item, 'group', null, formatDateLabel(createdAt)) ||
      formatDateLabel(createdAt),
    duration: pickEither(item, 'duration', null, '--') || '--',
    filterCategory,
    aiExplanation: pickEither(item, 'aiExplanation', null, mapped.reasoning) || mapped.reasoning,
    badge,
    badgeColor,
  };
};

export const mapAnalysisToStore = (data = {}) => {
  const mapped = mapAnalysisResponse(data);
  return {
    authenticityScore: mapped.authenticityScore,
    aiProbability: mapped.aiProbability,
    confidence: mapped.confidence,
    riskLevel: mapped.riskLevel,
    riskEvents: mapped.riskEvents,
    analysisReasons: mapped.analysisReasons,
    transcript: mapped.transcriptLines,
    lastAnalysis: mapped,
  };
};

export default mapAnalysisResponse;
