/**
 * Utility functions for detecting temporary 503 / high-demand errors
 * and cleaning raw JSON strings into patient-friendly error notices.
 */

export function is503OrUnavailableError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.statusCode || error.code || error.response?.status;
  if (status === 503 || status === 429) return true;

  const msg = (
    typeof error === 'string' ? error : (error.message || JSON.stringify(error))
  ).toLowerCase();

  return (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('high demand') ||
    msg.includes('resource_exhausted') ||
    msg.includes('resource has been exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('try again later') ||
    msg.includes('service unavailable')
  );
}

export function formatFriendlyErrorMessage(rawError: any): { is503: boolean; message: string } {
  const is503 = is503OrUnavailableError(rawError);
  let message =
    typeof rawError === 'string'
      ? rawError
      : (rawError?.message || 'An unexpected error occurred while processing the report.');

  // If the message contains a raw JSON object string, parse it cleanly
  try {
    const jsonMatch = message.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error?.message) {
        message = parsed.error.message;
      } else if (parsed.message) {
        message = parsed.message;
      }
    }
  } catch {
    // Keep message as is
  }

  // Remove common tech prefixes like "[GoogleGenerativeAI Error]: [503 Service Unavailable] "
  message = message.replace(/^\[?GoogleGenerativeAI Error\]?:\s*/i, '');
  message = message.replace(/^\[?\d{3}\s*([A-Za-z_ ]+)?\]?:\s*/i, '');

  if (
    message.toLowerCase().includes('status 200') ||
    message.toLowerCase().includes('failed with status 200')
  ) {
    message = 'The report analysis could not extract structured laboratory values. Please ensure the document is clear and readable, or click Try Again.';
  }

  if (is503) {
    return {
      is503: true,
      message:
        'The AI analysis service is temporarily experiencing high demand (503 Service Unavailable). Please try again in a moment or explore our Demo Report.',
    };
  }

  return { is503: false, message: message || 'Failed to process report. Please try again.' };
}
