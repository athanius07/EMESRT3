
const SOURCES = {
  mandates: [
    {
      country: 'South Africa',
      jurisdiction: 'DMRE',
      url: 'https://www.gov.za/sites/default/files/gcis_document/202212/47790gon2908.pdf',
      category: 'mandate',
      instrument_hint: 'Government Gazette 47790: commencement of regs 8.10.1.2(b) & 8.10.2.1(b) (auto retard/stop for TMM)'
    }
  ],
  subnational: [
    {
      country: 'Australia',
      jurisdiction: 'Queensland (RSHQ)',
      url: 'https://www.resources.qld.gov.au/__data/assets/pdf_file/0007/1346821/qld-guidance-note-27.pdf',
      category: 'subnational',
      instrument_hint: 'QGN 27 – Collision Prevention (guidance, not a mandate)'
    },
    {
      country: 'Australia',
      jurisdiction: 'NSW Resources Regulator',
      url: 'https://www.resources.nsw.gov.au/sites/default/files/documents/mdg-2007-guideline-for-the-selection-and-implementation-of-collision-management-systems-for-mining-2014.pdf',
      category: 'subnational',
      instrument_hint: 'MDG 2007 – Guideline for collision management systems (not a mandate)'
    }
  ],
  frameworks: [
    {
      country: 'Global',
      jurisdiction: 'EMESRT',
      url: 'https://www.emesrt.org/wp-content/uploads/EMESRT_VI_9-LayersOfDefenceGuide.pdf',
      category: 'framework',
      instrument_hint: 'EMESRT Vehicle Interaction 9-Layers of Defence Guide (L7/L8/L9 definitions)'
    },
    {
      country: 'Global',
      jurisdiction: 'ICMM',
      url: 'https://www.icmm.com/en-gb/our-work/cleaner-safer-vehicles',
      category: 'framework',
      instrument_hint: 'ICMM ICSV – vehicle interaction ambition and OEM collaboration'
    }
  ]
};
module.exports = { SOURCES };
