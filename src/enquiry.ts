export const EMAIL = 'bvishnupriyan2006@gmail.com';

/** Prepare a visitor-owned email draft. No network submission occurs here. */
export function enquiryDraft(data: FormData) {
  const value = (key: string) => String(data.get(key) || '').trim();
  const subject = `Video enquiry — ${value('name')}`;
  const body = `Hi Vishnu,\n\nName: ${value('name')}\nEmail: ${value('email')}\nProduct: ${value('product')}\nVideo: ${value('type')}\nDeadline / budget: ${value('timing')}\n\n${value('brief')}`;
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
