import { AgreementData } from '../types/crm';

export const RED_FLAG_HOMES_COMPANY_INFO = {
  name: 'Red Flag Homes Network',
  tagline: 'Luxury Hospitality & Airbnb Property Management',
  address: 'Guru Marg, Paschim Vihar, New Delhi',
  email: 'agreements@redflaghomes.in',
  phone: '+91 98765 43210',
  website: 'https://redflaghomes.in',
  logoText: 'RED FLAG HOMES',
};

export function renderMouText(data: AgreementData): string {
  const effectiveDate = data.effectiveDate || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const place = data.place || 'New Delhi, India';
  const ownerPercent = data.ownerPercent || 83;
  const coHostPercent = data.commissionPercent || data.coHostPercent || 17;
  const occupancyTarget = data.occupancyTarget || '60%–70%';
  const noticePeriod = data.noticePeriod || '15 days';
  const lockInPeriod = data.lockInPeriod || '6 months';

  const govtIdType = data.partyAGovtIdType || 'Government ID';
  const govtIdNumber = data.partyAGovtIdNumber || 'Provided during signing';

  const assetListText = data.assets && data.assets.length > 0
    ? data.assets.map((ast, i) => `  Asset #${i + 1}: ${ast.propertyAddress} [${ast.bhkCount || 'N/A'}]`).join('\n')
    : `  Primary Property Address: ${data.propertyAddress}`;

  return `
MEMORANDUM OF UNDERSTANDING (MOU)
LISTING & PROPERTY MANAGEMENT AGREEMENT

Agreement No: ${data.id}

This Memorandum of Understanding ("Agreement") is made and entered into on this ${effectiveDate} at ${place}.

BETWEEN:

ASSET HOLDING ENTITY / PROPERTY OWNER ("PARTY A"):
Full Name: ${data.partyAName || '[Owner Name]'}
Mobile Number: ${data.partyAMobile || '[Mobile Number]'}
Email Address: ${data.partyAEmail || '[Email Address]'}

REGISTERED ASSETS & PROPERTY ROOM DETAILS:
${assetListText}

GOVERNMENT IDENTITY & BANK PAYOUT DETAILS:
${govtIdType}: ${govtIdNumber}
Bank Account Name: ${data.partyABankDetails?.accountName || '[Account Holder Name]'}
Bank Name & Branch: ${data.partyABankDetails?.bankName || '[Bank Name]'}
Account Number: ${data.partyABankDetails?.accountNumber || '[Account Number]'}
IFSC Code: ${data.partyABankDetails?.ifscCode || '[IFSC Code]'}

AND

HOSPITALITY MANAGEMENT PARTNER ("PARTY B"):
Red Flag Homes Network
Official Corporate Desk: ${RED_FLAG_HOMES_COMPANY_INFO.address}
Corporate Email: ${RED_FLAG_HOMES_COMPANY_INFO.email}

--------------------------------------------------------------------------------

1. ROLE & SERVICES OF RED FLAG HOMES
The Red Flag Homes Network is appointed to manage guest communication and day-to-day coordination for the Owner’s Airbnb & hospitality property. The Red Flag will:
• Listing creation, optimization, and reply to guest messages within 15 minutes (using ready FAQs).
• Review booking requests, manage calendar availability & apply dynamic pricing algorithms.
• Track issues, maintenance requests, and guest feedback in a simple shared dashboard.
• Conduct regular quality audits (photos, title optimization, pricing competition analysis) to keep the listing competitive.
• Aim for 5-star guest experience and an average occupancy target of ${occupancyTarget}.

2. COSTS & EXPENSES
• All operational property costs (including rent, furniture, utilities, electricity, Wi-Fi, routine property maintenance, wear & tear, etc.) will be fully borne by the Asset Holding Entity (Party A).
• Red Flag Homes (Party B) will not be responsible for any property expenses or capital expenditures.

3. PAYOUT SPLIT
• Gross booking payout will be split as follows:
    - Owner (Party A): ${ownerPercent}%
    - Co-Host / Red Flag Homes (Party B): ${coHostPercent}%
• This split applies to:
    - All bookings through Airbnb, Booking.com, and the official Red Flag Homes Website.
    - Bookings through any other platform (Agoda, MakeMyTrip, GoIbibo, etc. if listed by Party B).

4. PAYMENTS & INCENTIVES
• Payouts will be calculated from the total gross sales generated (before property expenses).
• The ${coHostPercent}% Party B share and ${ownerPercent}% Party A share shall be directly configured in the Airbnb payout section when adding Red Flag Homes, ensuring split automation wherever supported.
• Payments will be made on the 1st and 16th of every month as per standard platform payout cycles (or other platform schedules).
• Additionally, Party B may be considered for a performance-based incentive of up to 7%, calculated on the earnings share of Party A, subject to achieving the mutually agreed occupancy target of ${occupancyTarget}. This incentive shall be purely discretionary and granted only upon the sole written approval of Party A. It shall not be construed as a fixed or guaranteed component of the commercial arrangement, nor as an automatic charge on total revenue.

5. OWNER ACCESS & BLOCKING RIGHTS
• The Owner (Party A) shall have the right to access and utilize the property for personal use or to carry out necessary maintenance, upgrades, or inspections.
• However, such personal use shall be exercised reasonably and shall not be excessive or frequent in a manner that materially impacts booking availability, occupancy performance, or overall business operations.
• The Owner must provide prior notice to Party B for any intended personal stay, and Party B shall accordingly block the property calendar for the specified duration.

6. PAYMENT FLOW FROM THIRD-PARTY PLATFORMS
• In cases where bookings are received through third-party platforms that do not support direct automated payout splitting to the Owner (Party A), the entire payment may be received in the account of Party B.
• In such instances, Party B shall retain its agreed commission of ${coHostPercent}% (or as per agreed commercial terms) and transfer the remaining ${ownerPercent}% share to Party A within a mutually agreed timeline.
• Party B agrees to maintain full transparency in reporting such transactions and ensure timely settlements to the Owner.

7. TERM & TERMINATION
• This Agreement will remain valid until terminated by either party in writing.
• Neither party can terminate this Agreement within the first ${lockInPeriod} of service ("Lock-In Period").
• After ${lockInPeriod}, either party may terminate this Agreement by providing ${noticePeriod} written notice.
• Upon termination, pending payouts will be settled immediately. Any unauthorized early exit prior to the lock-in period leads to holding of pending payouts until complete audit.

8. COMPLIMENTARY ACCESS FOR SERVICE ENHANCEMENT & MARKETING
• To ensure high-quality hosting, continuous improvement, and effective marketing, Party B (Red Flag Homes) may access and use the property on a complimentary basis for up to 24 consecutive hours once per month, or alternatively in two sessions of 12 hours each within the same month.
• Such access may be used for purposes including, but not limited to, auditing the guest experience, testing property amenities, conducting photography or videography, creating promotional content, reviewing property setup, showcasing the property across digital marketing channels, or organizing barter collaborations with influencers, creators, media partners, or brand partners for promotional purposes.
• Any complimentary stay provided to an influencer, creator, or collaborator shall be subject to the prior approval of Party A, unless otherwise agreed in writing.
• Such collaborations shall be undertaken solely to enhance the property’s visibility, brand awareness, and booking performance. This complimentary access shall only take place when the property is vacant and not reserved by paying guests, and shall be considered part of Party B’s service role in enhancing listing performance and marketing the property.

--------------------------------------------------------------------------------

IN WITNESS WHEREOF, the Parties hereto have set their hands and seals to this Memorandum of Understanding on the date and year first above written.
`;
}
