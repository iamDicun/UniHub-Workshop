/**
 * Filter 4: Response Parser
 *
 * Parses the AI's JSON response, validates fields, and provides defaults
 * for missing or invalid fields.
 *
 * Input:  { rawResponse: string, pageCount, objectKey }
 * Output: { title, description, capacity, price, start_time, end_time, location, speaker }
 */

const isValidDate = (value) => {
  if (!value) return false;
  const d = new Date(value);
  return d instanceof Date && !isNaN(d.getTime());
};

const defaultStartTime = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(8, 0, 0, 0);
  return d.toISOString();
};

const defaultEndTime = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(11, 0, 0, 0);
  return d.toISOString();
};

export const responseParser = async (input, context) => {
  const { rawResponse } = input;

  if (!rawResponse) {
    throw new Error('AI returned empty response.');
  }

  let parsed;
  try {
    // Strip potential markdown code fences
    let jsonStr = rawResponse.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(
      `AI response is not valid JSON. Raw: ${rawResponse.slice(0, 200)}...`
    );
  }

  const result = {
    title: (parsed.title || '').trim(),
    description: (parsed.description || '').trim(),
    capacity: Number.isFinite(Number(parsed.capacity)) && Number(parsed.capacity) > 0
      ? Math.floor(Number(parsed.capacity))
      : 50,
    price: Number.isFinite(Number(parsed.price)) && Number(parsed.price) >= 0
      ? Math.floor(Number(parsed.price))
      : 0,
    start_time: isValidDate(parsed.start_time)
      ? new Date(parsed.start_time).toISOString()
      : defaultStartTime(),
    end_time: isValidDate(parsed.end_time)
      ? new Date(parsed.end_time).toISOString()
      : defaultEndTime(),
    location: (parsed.location || '').trim(),
    speaker: (parsed.speaker || '').trim(),
  };

  // Validate title is not empty
  if (!result.title) {
    result.title = 'Workshop Mới';
  }

  // Ensure end_time is after start_time
  if (new Date(result.end_time) <= new Date(result.start_time)) {
    const end = new Date(result.start_time);
    end.setHours(end.getHours() + 3);
    result.end_time = end.toISOString();
  }

  return result;
};
