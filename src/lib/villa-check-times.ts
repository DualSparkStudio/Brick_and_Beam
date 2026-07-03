export const VILLA_CHECK_TIME_KEYS = {
  check_in_time: 'villa_check_in_time',
  check_out_time: 'villa_check_out_time',
} as const

export const DEFAULT_CHECK_IN_TIME = '1:00 PM'
export const DEFAULT_CHECK_OUT_TIME = '10:00 AM'

export interface VillaCheckTimes {
  check_in_time: string
  check_out_time: string
}

function normalizeTimeLabel(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(\d)(AM|PM)\b/gi, '$1 $2')
    .replace(/\b(am|pm)\b/g, (match) => match.toUpperCase())
}

/** Parse check-in / check-out from a single house-rule sentence. */
export function parseCheckTimesFromHouseRuleText(text: string): Partial<VillaCheckTimes> {
  const checkInMatch = text.match(
    /check[-\s]?in(?:\s+time)?(?:\s+is|\s+at)?\s*:?\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))/i
  )
  const checkOutMatch = text.match(
    /check[-\s]?out(?:\s+time)?(?:\s+is|\s+at)?\s*:?\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))/i
  )

  return {
    ...(checkInMatch ? { check_in_time: normalizeTimeLabel(checkInMatch[1]) } : {}),
    ...(checkOutMatch ? { check_out_time: normalizeTimeLabel(checkOutMatch[1]) } : {}),
  }
}

export function parseCheckTimesFromHouseRules(
  rules: Array<{ rule_text: string; is_active?: boolean }>
): Partial<VillaCheckTimes> {
  for (const rule of rules) {
    if (rule.is_active === false) continue
    const parsed = parseCheckTimesFromHouseRuleText(rule.rule_text)
    if (parsed.check_in_time || parsed.check_out_time) {
      return parsed
    }
  }
  return {}
}

export function formatHouseRuleCheckTimesText(checkIn: string, checkOut: string): string {
  return `Check-in time is ${checkIn} and check-out time is ${checkOut}`
}

export function resolveVillaCheckTimes(
  sources: {
    settingsCheckIn?: string
    settingsCheckOut?: string
    houseRules?: Array<{ rule_text: string; is_active?: boolean }>
    roomCheckIn?: string
    roomCheckOut?: string
  } = {}
): VillaCheckTimes {
  const fromRules = parseCheckTimesFromHouseRules(sources.houseRules ?? [])

  const checkIn =
    sources.settingsCheckIn?.trim() ||
    fromRules.check_in_time ||
    sources.roomCheckIn?.trim() ||
    DEFAULT_CHECK_IN_TIME

  const checkOut =
    sources.settingsCheckOut?.trim() ||
    fromRules.check_out_time ||
    sources.roomCheckOut?.trim() ||
    DEFAULT_CHECK_OUT_TIME

  return { check_in_time: checkIn, check_out_time: checkOut }
}

export function formatCheckInOutLine(times: VillaCheckTimes): string {
  return `Check-in: ${times.check_in_time} · Check-out: ${times.check_out_time}`
}

export function formatCheckInOutPipe(times: VillaCheckTimes): string {
  return `Check In: ${times.check_in_time} | Check Out: ${times.check_out_time}`
}

export function formatCheckInFaqAnswer(times: VillaCheckTimes): string {
  return `Check-in time is ${times.check_in_time} onwards and check-out time is ${times.check_out_time}. Check-in and check-out times are flexible depending on other bookings. Please contact us for early check-in or late check-out requests.`
}

export function formatCheckInOnwards(times: VillaCheckTimes): string {
  return `${times.check_in_time} onwards`
}

export function formatCheckInFromLabel(times: VillaCheckTimes): string {
  return `Check-in from ${times.check_in_time}`
}

export function formatPolicyCheckInOut(times: VillaCheckTimes): string {
  return `Villa check-in time is ${times.check_in_time} and check-out time is ${times.check_out_time}. Check-out is strictly at ${times.check_out_time}. For late check-out you may be charged the full villa rate for that day.`
}

export function isCheckInOutFaqQuestion(question: string): boolean {
  return /check[-\s]?in.*check[-\s]?out|check[-\s]?out.*check[-\s]?in/i.test(question)
}

export function resolveFaqAnswer(question: string, answer: string, times: VillaCheckTimes): string {
  if (isCheckInOutFaqQuestion(question)) {
    return formatCheckInFaqAnswer(times)
  }
  return answer
}
