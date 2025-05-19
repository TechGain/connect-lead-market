import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formats a lead type from kebab-case to Title Case
 * Example: "full-home-renovation" -> "Full Home Renovation"
 * Special case for "hvac" -> "HVAC" (all caps)
 */
export function formatLeadType(type: string): string {
  if (!type) return '';
  
  // Special case for "hvac" - return it in all caps
  if (type.toLowerCase() === 'hvac') {
    return 'HVAC';
  }
  
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Applies a 20% markup to the lead price for buyers in the marketplace
 * @param price The base price set by the seller
 * @returns The price with 20% markup applied
 */
export function applyBuyerPriceMarkup(price: number): number {
  return price * 1.2;  // Apply 20% markup
}

// Enhanced ZIP codes to city mappings - significantly expanded
const zipToCityMap: Record<string, string> = {
  // California
  '90001': 'Los Angeles', '90002': 'Los Angeles', '90003': 'Los Angeles',
  '90004': 'Los Angeles', '90005': 'Los Angeles', '90006': 'Los Angeles',
  '90007': 'Los Angeles', '90008': 'Los Angeles', '90010': 'Los Angeles',
  '90011': 'Los Angeles', '90012': 'Los Angeles', '90013': 'Los Angeles',
  '90014': 'Los Angeles', '90015': 'Los Angeles', '90016': 'Los Angeles',
  '90017': 'Los Angeles', '90018': 'Los Angeles', '90019': 'Los Angeles',
  '90020': 'Los Angeles', '90021': 'Los Angeles', '90022': 'East Los Angeles',
  '90023': 'Los Angeles', '90024': 'Los Angeles', '90025': 'Los Angeles',
  '90026': 'Los Angeles', '90027': 'Los Angeles', '90028': 'Los Angeles',
  '90029': 'Los Angeles', '90030': 'Los Angeles', '90031': 'Los Angeles',
  '90032': 'Los Angeles', '90033': 'Los Angeles', '90034': 'Los Angeles',
  '90035': 'Los Angeles', '90036': 'Los Angeles', '90037': 'Los Angeles',
  '90038': 'Los Angeles', '90039': 'Los Angeles', '90040': 'Commerce',
  '90041': 'Los Angeles', '90042': 'Los Angeles', '90043': 'Los Angeles',
  '90044': 'Los Angeles', '90045': 'Los Angeles', '90046': 'Los Angeles',
  '90047': 'Los Angeles', '90048': 'Los Angeles', '90049': 'Los Angeles',
  '90210': 'Beverly Hills', '90211': 'Beverly Hills', '90212': 'Beverly Hills',
  '90230': 'Culver City', '90232': 'Culver City', '90245': 'El Segundo',
  '90247': 'Gardena', '90248': 'Gardena', '90249': 'Gardena',
  '90254': 'Hermosa Beach', '90255': 'Huntington Park', '90260': 'Lawndale',
  '90261': 'Lawndale', '90262': 'Lynwood', '90263': 'Malibu',
  '90265': 'Malibu', '90266': 'Manhattan Beach', '90270': 'Maywood',
  '90272': 'Pacific Palisades', '90274': 'Palos Verdes Peninsula', '90275': 'Rancho Palos Verdes',
  '90277': 'Redondo Beach', '90278': 'Redondo Beach', '90280': 'South Gate',
  '90290': 'Topanga', '90291': 'Venice', '90292': 'Marina Del Rey',
  '90293': 'Playa Del Rey', '90301': 'Inglewood', '90302': 'Inglewood',
  '90303': 'Inglewood', '90304': 'Inglewood', '90305': 'Inglewood',
  '90401': 'Santa Monica', '90402': 'Santa Monica', '90403': 'Santa Monica',
  '90404': 'Santa Monica', '90405': 'Santa Monica', '90501': 'Torrance',
  '90502': 'Torrance', '90503': 'Torrance', '90504': 'Torrance',
  '90505': 'Torrance', '90601': 'Whittier', '90602': 'Whittier',
  '90603': 'Whittier', '90604': 'Whittier', '90605': 'Whittier',
  '90606': 'Whittier', '90631': 'La Habra', '90638': 'La Mirada',
  '90640': 'Montebello', '90650': 'Norwalk', '90660': 'Pico Rivera',
  '90670': 'Santa Fe Springs', '90701': 'Artesia', '90703': 'Cerritos',
  '90706': 'Bellflower', '90710': 'Harbor City', '90712': 'Lakewood',
  '90713': 'Lakewood', '90715': 'Lakewood', '90716': 'Hawaiian Gardens',
  '90717': 'Lomita', '90720': 'Los Alamitos', '90723': 'Paramount',
  '90731': 'San Pedro', '90732': 'San Pedro', '90744': 'Wilmington',
  '90745': 'Carson', '90746': 'Carson', '90755': 'Signal Hill',
  '90802': 'Long Beach', '90803': 'Long Beach', '90804': 'Long Beach',
  '90805': 'Long Beach', '90806': 'Long Beach', '90807': 'Long Beach',
  '90808': 'Long Beach', '90810': 'Long Beach', '90813': 'Long Beach',
  '90814': 'Long Beach', '90815': 'Long Beach', '90822': 'Long Beach',
  '91001': 'Altadena', '91006': 'Arcadia', '91007': 'Arcadia',
  '91010': 'Duarte', '91011': 'La Canada Flintridge', '91016': 'Monrovia',
  '91020': 'Montrose', '91024': 'Sierra Madre', '91030': 'South Pasadena',
  '91040': 'Sunland', '91042': 'Tujunga', '91101': 'Pasadena',
  '91103': 'Pasadena', '91104': 'Pasadena', '91105': 'Pasadena',
  '91106': 'Pasadena', '91107': 'Pasadena', '91108': 'San Marino',
  '91201': 'Glendale', '91202': 'Glendale', '91203': 'Glendale',
  '91204': 'Glendale', '91205': 'Glendale', '91206': 'Glendale',
  '91207': 'Glendale', '91208': 'Glendale', '91214': 'La Crescenta',
  '91301': 'Agoura Hills', '91302': 'Calabasas', '91303': 'Canoga Park',
  '91304': 'Canoga Park', '91306': 'Winnetka', '91307': 'West Hills',
  '91311': 'Chatsworth', '91316': 'Encino', '91321': 'Newhall',
  '91324': 'Northridge', '91325': 'Northridge', '91326': 'Porter Ranch',
  '91330': 'Northridge', '91331': 'Pacoima', '91335': 'Reseda',
  '91340': 'San Fernando', '91342': 'Sylmar', '91343': 'North Hills',
  '91344': 'Granada Hills', '91345': 'Mission Hills', '91350': 'Santa Clarita',
  '91351': 'Canyon Country', '91352': 'Sun Valley', '91354': 'Valencia',
  '91355': 'Valencia', '91356': 'Tarzana', '91364': 'Woodland Hills',
  '91367': 'Woodland Hills', '91381': 'Stevenson Ranch', '91384': 'Castaic',
  '91387': 'Canyon Country', '91390': 'Santa Clarita', '91401': 'Van Nuys',
  '91402': 'Panorama City', '91403': 'Sherman Oaks', '91405': 'Van Nuys',
  '91406': 'Van Nuys', '91411': 'Van Nuys', '91423': 'Sherman Oaks',
  '91436': 'Encino', '91501': 'Burbank', '91502': 'Burbank',
  '91504': 'Burbank', '91505': 'Burbank', '91506': 'Burbank',
  '91601': 'North Hollywood', '91602': 'North Hollywood', '91604': 'Studio City',
  '91605': 'North Hollywood', '91606': 'North Hollywood', '91607': 'Valley Village',
  '91608': 'Universal City', '91702': 'Azusa', '91706': 'Baldwin Park',
  '91711': 'Claremont', '91722': 'Covina', '91723': 'Covina',
  '91724': 'Covina', '91730': 'Rancho Cucamonga', '91731': 'El Monte',
  '91732': 'El Monte', '91733': 'South El Monte', '91740': 'Glendora',
  '91741': 'Glendora', '91744': 'La Puente', '91745': 'Hacienda Heights',
  '91746': 'La Puente', '91748': 'Rowland Heights', '91750': 'La Verne',
  '91754': 'Monterey Park', '91755': 'Monterey Park', '91759': 'Mt Baldy',
  '91764': 'Ontario', '91765': 'Diamond Bar', '91766': 'Phillips Ranch',
  '91767': 'Pomona', '91768': 'Pomona', '91770': 'Rosemead',
  '91773': 'San Dimas', '91775': 'San Gabriel', '91776': 'San Gabriel',
  '91780': 'Temple City', '91784': 'Upland', '91786': 'Upland',
  '91789': 'Walnut', '91790': 'West Covina', '91791': 'West Covina',
  '91792': 'West Covina', '91801': 'Alhambra', '91803': 'Alhambra',
  '92612': 'Irvine', '92614': 'Irvine', '92617': 'Irvine',
  '92618': 'Irvine', '92626': 'Costa Mesa', '92627': 'Costa Mesa',
  '92646': 'Huntington Beach', '92647': 'Huntington Beach', '92648': 'Huntington Beach',
  '92649': 'Huntington Beach', '92660': 'Newport Beach', '92661': 'Newport Beach',
  '92662': 'Newport Beach', '92663': 'Newport Beach', '92701': 'Santa Ana',
  '92703': 'Santa Ana', '92704': 'Santa Ana', '92705': 'Santa Ana',
  '92706': 'Santa Ana', '92707': 'Santa Ana', '92780': 'Tustin',
  '92782': 'Tustin', '92801': 'Anaheim', '92802': 'Anaheim',
  '92804': 'Anaheim', '92805': 'Anaheim', '92806': 'Anaheim',
  '92807': 'Anaheim', '92821': 'Brea', '92823': 'Brea',
  '92831': 'Fullerton', '92832': 'Fullerton', '92833': 'Fullerton',
  '92835': 'Fullerton', '92840': 'Garden Grove', '92841': 'Garden Grove',
  '92843': 'Garden Grove', '92844': 'Garden Grove', '92845': 'Garden Grove',
  '92865': 'Orange', '92866': 'Orange', '92867': 'Orange',
  '92868': 'Orange', '92869': 'Orange', '92870': 'Placentia',
  '92886': 'Yorba Linda', '92887': 'Yorba Linda', '93001': 'Ventura',
  '93003': 'Ventura', '93004': 'Ventura', '93010': 'Camarillo',
  '93012': 'Camarillo', '93015': 'Fillmore', '93021': 'Moorpark',
  '93023': 'Ojai', '93030': 'Oxnard', '93033': 'Oxnard',
  '93035': 'Oxnard', '93036': 'Oxnard', '93040': 'Piru',
  '93041': 'Port Hueneme', '93060': 'Santa Paula', '93063': 'Simi Valley',
  '93065': 'Simi Valley', '93066': 'Somis', '93101': 'Santa Barbara',
  '93103': 'Santa Barbara', '93105': 'Santa Barbara', '93108': 'Montecito',
  '93109': 'Santa Barbara', '93110': 'Santa Barbara', '93111': 'Santa Barbara',
  '93117': 'Goleta', '93441': 'Los Olivos', '93460': 'Santa Ynez',
  '93463': 'Solvang', '93534': 'Lancaster', '93535': 'Lancaster',
  '93536': 'Lancaster', '93550': 'Palmdale', '93551': 'Palmdale',
  '93552': 'Palmdale', '94016': 'San Francisco', '94102': 'San Francisco',
  '94103': 'San Francisco', '94104': 'San Francisco', '94105': 'San Francisco',
  '94107': 'San Francisco', '94108': 'San Francisco', '94109': 'San Francisco',
  '94110': 'San Francisco', '94111': 'San Francisco', '94112': 'San Francisco',
  '94114': 'San Francisco', '94115': 'San Francisco', '94116': 'San Francisco',
  '94117': 'San Francisco', '94118': 'San Francisco', '94121': 'San Francisco',
  '94122': 'San Francisco', '94123': 'San Francisco', '94124': 'San Francisco',
  '94127': 'San Francisco', '94129': 'San Francisco', '94130': 'San Francisco',
  '94131': 'San Francisco', '94132': 'San Francisco', '94133': 'San Francisco',
  '94134': 'San Francisco', '94158': 'San Francisco', '94401': 'San Mateo',
  '94402': 'San Mateo', '94403': 'San Mateo', '94404': 'Foster City',
  '94501': 'Alameda', '94502': 'Alameda', '94505': 'Discovery Bay',
  '94506': 'Danville', '94507': 'Alamo', '94508': 'Angwin',
  '94509': 'Antioch', '94510': 'Benicia', '94511': 'Bethel Island',
  '94512': 'Birds Landing', '94513': 'Brentwood', '94514': 'Byron',
  '94515': 'Calistoga', '94516': 'Canyon', '94517': 'Clayton',
  '94518': 'Concord', '94519': 'Concord', '94520': 'Concord',
  '94521': 'Concord', '94523': 'Pleasant Hill', '94525': 'Crockett',
  '94526': 'Danville', '95814': 'Sacramento', '95815': 'Sacramento', 
  '95816': 'Sacramento', '95817': 'Sacramento', '95818': 'Sacramento',
  '95819': 'Sacramento', '95820': 'Sacramento', '95821': 'Sacramento',
  
  // New York
  '10001': 'New York', '10002': 'New York', '10003': 'New York',
  '10004': 'New York', '10005': 'New York', '10006': 'New York',
  '10007': 'New York', '10009': 'New York', '10010': 'New York',
  '10011': 'New York', '10012': 'New York', '10013': 'New York',
  '10014': 'New York', '10016': 'New York', '10017': 'New York',
  '10018': 'New York', '10019': 'New York', '10020': 'New York',
  '10021': 'New York', '10022': 'New York', '10023': 'New York',
  '10024': 'New York', '10025': 'New York', '10026': 'New York',
  '10027': 'New York', '10028': 'New York', '10029': 'New York',
  '10030': 'New York', '10031': 'New York', '10032': 'New York',
  '10033': 'New York', '10034': 'New York', '10035': 'New York',
  '10036': 'New York', '10037': 'New York', '10038': 'New York',
  '10039': 'New York', '10040': 'New York', '10044': 'New York',
  '10065': 'New York', '10069': 'New York', '10075': 'New York',
  '10103': 'New York', '10110': 'New York', '10111': 'New York',
  '10112': 'New York', '10115': 'New York', '10119': 'New York',
  '10128': 'New York', '10154': 'New York', '10165': 'New York',
  '10169': 'New York', '10170': 'New York', '10171': 'New York',
  '10172': 'New York', '10173': 'New York', '10174': 'New York',
  '10177': 'New York', '10199': 'New York', '10271': 'New York',
  '10278': 'New York', '10279': 'New York', '10280': 'New York',
  '10282': 'New York', '10301': 'Staten Island', '10302': 'Staten Island',
  '10303': 'Staten Island', '10304': 'Staten Island', '10305': 'Staten Island',
  '10306': 'Staten Island', '10307': 'Staten Island', '10308': 'Staten Island',
  '10309': 'Staten Island', '10310': 'Staten Island', '10312': 'Staten Island',
  '10314': 'Staten Island', '10451': 'Bronx', '10452': 'Bronx',
  '10453': 'Bronx', '10454': 'Bronx', '10455': 'Bronx',
  '10456': 'Bronx', '10457': 'Bronx', '10458': 'Bronx',
  '10459': 'Bronx', '10460': 'Bronx', '10461': 'Bronx',
  '10462': 'Bronx', '10463': 'Bronx', '10464': 'Bronx',
  '10465': 'Bronx', '10466': 'Bronx', '10467': 'Bronx',
  '10468': 'Bronx', '10469': 'Bronx', '10470': 'Bronx',
  '10471': 'Bronx', '10472': 'Bronx', '10473': 'Bronx',
  '10474': 'Bronx', '10475': 'Bronx', '11201': 'Brooklyn',
  '11203': 'Brooklyn', '11204': 'Brooklyn', '11205': 'Brooklyn',
  '11206': 'Brooklyn', '11207': 'Brooklyn', '11208': 'Brooklyn',
  '11209': 'Brooklyn', '11210': 'Brooklyn', '11211': 'Brooklyn',
  '11212': 'Brooklyn', '11213': 'Brooklyn', '11214': 'Brooklyn',
  '11215': 'Brooklyn', '11216': 'Brooklyn', '11217': 'Brooklyn',
  '11218': 'Brooklyn', '11219': 'Brooklyn', '11220': 'Brooklyn',
  '11221': 'Brooklyn', '11222': 'Brooklyn', '11223': 'Brooklyn',
  '11224': 'Brooklyn', '11225': 'Brooklyn', '11226': 'Brooklyn',
  '11228': 'Brooklyn', '11229': 'Brooklyn', '11230': 'Brooklyn',
  '11231': 'Brooklyn', '11232': 'Brooklyn', '11233': 'Brooklyn',
  '11234': 'Brooklyn', '11235': 'Brooklyn', '11236': 'Brooklyn',
  '11237': 'Brooklyn', '11238': 'Brooklyn', '11239': 'Brooklyn',
  '11354': 'Flushing', '11355': 'Flushing', '11356': 'College Point',
  '11357': 'Whitestone', '11358': 'Flushing', '11359': 'Bayside',
  '11360': 'Bayside', '11361': 'Bayside', '11362': 'Little Neck',
  '11363': 'Little Neck', '11364': 'Oakland Gardens', '11365': 'Fresh Meadows',
  '11366': 'Fresh Meadows', '11367': 'Flushing', '11368': 'Corona',
  '11369': 'East Elmhurst', '11370': 'East Elmhurst', '11371': 'Flushing',
  '11372': 'Jackson Heights', '11373': 'Elmhurst', '11374': 'Rego Park',
  '11375': 'Forest Hills', '11377': 'Woodside', '11378': 'Maspeth',
  '11379': 'Middle Village', '11385': 'Ridgewood', '11411': 'Cambria Heights',
  '11412': 'Saint Albans', '11413': 'Springfield Gardens', '11414': 'Howard Beach',
  '11415': 'Kew Gardens', '11416': 'Ozone Park', '11417': 'Ozone Park',
  '11418': 'Richmond Hill', '11419': 'South Richmond Hill', '11420': 'South Ozone Park',
  '11421': 'Woodhaven', '11422': 'Rosedale', '11423': 'Hollis',
  '11424': 'Jamaica', '11425': 'Jamaica', '11426': 'Bellerose',
  '11427': 'Queens Village', '11428': 'Queens Village', '11429': 'Queens Village',
  '11430': 'Jamaica', '11432': 'Jamaica', '11433': 'Jamaica',
  '11434': 'Jamaica', '11435': 'Jamaica', '11436': 'Jamaica',
  '11451': 'Jamaica', '11691': 'Far Rockaway', '11692': 'Arverne',
  '11693': 'Far Rockaway', '11694': 'Rockaway Park', '11697': 'Breezy Point',
  
  // Texas
  '75001': 'Addison', '75002': 'Allen', '75006': 'Carrollton',
  '75007': 'Carrollton', '75010': 'Carrollton', '75013': 'Allen',
  '75019': 'Coppell', '75023': 'Plano', '75024': 'Plano',
  '75025': 'Plano', '75028': 'Flower Mound', '75034': 'Frisco',
  '75035': 'Frisco', '75038': 'Irving', '75039': 'Irving',
  '75040': 'Garland', '75041': 'Garland', '75042': 'Garland',
  '75043': 'Garland', '75044': 'Garland', '75048': 'Sachse',
  '75050': 'Grand Prairie', '75051': 'Grand Prairie', '75052': 'Grand Prairie',
  '75054': 'Grand Prairie', '75056': 'The Colony', '75057': 'Lewisville',
  '75060': 'Irving', '75061': 'Irving', '75062': 'Irving',
  '75063': 'Irving', '75067': 'Lewisville', '75068': 'Little Elm',
  '75069': 'McKinney', '75070': 'McKinney', '75071': 'McKinney',
  '75075': 'Plano', '75076': 'Pottsboro', '75077': 'Lewisville',
  '75078': 'Prosper', '75080': 'Richardson', '75081': 'Richardson',
  '75082': 'Richardson', '75087': 'Rockwall', '75088': 'Rowlett',
  '75089': 'Rowlett', '75093': 'Plano', '75094': 'Plano',
  '75098': 'Wylie', '75104': 'Cedar Hill', '75115': 'DeSoto',
  '75116': 'Duncanville', '75126': 'Forney', '75149': 'Mesquite',
  '75150': 'Mesquite', '75154': 'Seagoville', '75159': 'Seagoville',
  '77001': 'Houston', '77002': 'Houston', '77003': 'Houston',
  '77004': 'Houston', '77005': 'Houston', '77006': 'Houston',
  '77007': 'Houston', '77008': 'Houston', '77009': 'Houston',
  '77010': 'Houston', '77011': 'Houston', '77012': 'Houston',
  '77013': 'Houston', '77014': 'Houston', '77015': 'Houston',
  '77016': 'Houston', '77017': 'Houston', '77018': 'Houston',
  '77019': 'Houston', '77020': 'Houston', '77021': 'Houston',
  '77022': 'Houston', '77023': 'Houston', '77024': 'Houston',
  '77025': 'Houston', '77026': 'Houston', '77027': 'Houston',
  '77028': 'Houston', '77029': 'Houston', '77030': 'Houston',
  '77031': 'Houston', '77032': 'Houston', '77033': 'Houston',
  '77034': 'Houston', '77035': 'Houston', '77036': 'Houston',
  '77037': 'Houston', '77038': 'Houston', '77039': 'Houston',
  '77040': 'Houston', '77041': 'Houston', '77042': 'Houston',
  '77043': 'Houston', '77044': 'Houston', '77045': 'Houston',
  '77046': 'Houston', '77047': 'Houston', '77048': 'Houston',
  '77049': 'Houston', '77050': 'Houston', '77051': 'Houston',
  '77054': 'Houston', '77055': 'Houston', '77056': 'Houston',
  '77057': 'Houston', '77058': 'Houston', '77059': 'Houston',
  '77060': 'Houston', '77061': 'Houston', '77062': 'Houston',
  '77063': 'Houston', '77064': 'Houston', '77065': 'Houston',
  '77066': 'Houston', '77067': 'Houston', '77068': 'Houston',
  '77069': 'Houston', '77070': 'Houston', '77071': 'Houston',
  '77072': 'Houston', '77073': 'Houston', '77074': 'Houston',
  '77075': 'Houston', '77076': 'Houston', '77077': 'Houston',
  '77078': 'Houston', '77079': 'Houston', '77080': 'Houston',
  '77081': 'Houston', '77082': 'Houston', '77083': 'Houston',
  '77084': 'Houston', '77085': 'Houston', '77086': 'Houston',
  '77087': 'Houston', '77088': 'Houston', '77089': 'Houston',
  '77090': 'Houston', '77091': 'Houston', '77092': 'Houston',
  '77093': 'Houston', '77094': 'Houston', '77095': 'Houston',
  '77096': 'Houston', '77098': 'Houston', '77099': 'Houston',
  '77338': 'Humble', '77339': 'Humble', '77345': 'Humble',
  '77346': 'Humble', '77347': 'Humble', '77357': 'Porter',
  '77365': 'Porter', '77371': 'Shepherd', '77373': 'Spring',
  '77375': 'Tomball', '77377': 'Tomball', '77379': 'Spring',
  '77380': 'Spring', '77381': 'Spring', '77382': 'Spring',
  '77386': 'Spring', '77388': 'Spring', '77389': 'Spring',
  '77396': 'Humble', '77401': 'Bellaire', '77429': 'Cypress',
  '77433': 'Cypress', '77447': 'Hockley', '77449': 'Katy',
  '77450': 'Katy', '77459': 'Missouri City', '77469': 'Richmond',
  '77471': 'Rosenberg', '77477': 'Stafford', '77478': 'Sugar Land',
  '77479': 'Sugar Land', '77489': 'Missouri City', '77493': 'Katy',
  '77494': 'Katy', '77498': 'Sugar Land', '77545': 'Fresno',
  '77546': 'Friendswood', '77547': 'Galena Park', '77571': 'La Porte',
  '77573': 'League City', '77578': 'Manvel', '77581': 'Pearland',
  '77584': 'Pearland', '77586': 'Seabrook', '77587': 'South Houston',
  '77598': 'Webster',
  
  '78701': 'Austin', '78702': 'Austin', '78703': 'Austin',
  '78704': 'Austin', '78705': 'Austin', '78712': 'Austin',
  '78717': 'Austin', '78719': 'Austin', '78721': 'Austin',
  '78722': 'Austin', '78723': 'Austin', '78724': 'Austin',
  '78725': 'Austin', '78726': 'Austin', '78727': 'Austin',
  '78728': 'Austin', '78729': 'Austin', '78730': 'Austin',
  '78731': 'Austin', '78732': 'Austin', '78733': 'Austin',
  '78734': 'Austin', '78735': 'Austin', '78736': 'Austin',
  '78737': 'Austin', '78738': 'Austin', '78739': 'Austin',
  '78741': 'Austin', '78742': 'Austin', '78744': 'Austin',
  '78745': 'Austin', '78746': 'Austin', '78747': 'Austin',
  '78748': 'Austin', '78749': 'Austin', '78750': 'Austin',
  '78751': 'Austin', '78752': 'Austin', '78753': 'Austin',
  '78754': 'Austin', '78756': 'Austin', '78757': 'Austin',
  '78758': 'Austin', '78759': 'Austin',
  
  // Florida
  '33101': 'Miami', '33124': 'Miami', '33125': 'Miami',
  '33126': 'Miami', '33127': 'Miami', '33128': 'Miami',
  '33129': 'Miami', '33130': 'Miami', '33131': 'Miami',
  '33132': 'Miami', '33133': 'Miami', '33134': 'Coral Gables',
  '33135': 'Miami', '33136': 'Miami', '33137': 'Miami',
  '33138': 'Miami', '33139': 'Miami Beach', '33140': 'Miami Beach',
  '33141': 'Miami Beach', '33142': 'Miami', '33143': 'Miami',
  '33144': 'Miami', '33145': 'Miami', '33146': 'Miami',
  '33147': 'Miami', '33149': 'Key Biscayne', '33150': 'Miami',
  '33154': 'Bal Harbour', '33155': 'Miami', '33156': 'Miami',
  '33157': 'Miami', '33158': 'Miami', '33160': 'North Miami Beach',
  '33161': 'North Miami', '33162': 'Miami', '33165': 'Miami',
  '33166': 'Miami', '33167': 'Miami', '33168': 'Miami',
  '33169': 'Miami', '33170': 'Miami', '33172': 'Miami',
  '33173': 'Miami', '33174': 'Miami', '33175': 'Miami',
  '33176': 'Miami', '33177': 'Miami', '33178': 'Miami',
  '33179': 'Miami', '33180': 'Miami', '33181': 'Miami',
  '33182': 'Miami', '33183': 'Miami', '33184': 'Miami',
  '33185': 'Miami', '33186': 'Miami', '33187': 'Miami',
  '33189': 'Miami', '33190': 'Miami', '33193': 'Miami',
  '33194': 'Miami', '33196': 'Miami',
  '32801': 'Orlando', '32803': 'Orlando', '32804': 'Orlando',
  '32805': 'Orlando', '32806': 'Orlando', '32807': 'Orlando',
  '32808': 'Orlando', '32809': 'Orlando', '32810': 'Orlando',
  '32811': 'Orlando', '32812': 'Orlando', '32814': 'Orlando',
  '32817': 'Orlando', '32819': 'Orlando', '32821': 'Orlando',
  '32822': 'Orlando', '32824': 'Orlando', '32825': 'Orlando',
  '32827': 'Orlando', '32828': 'Orlando', '32829': 'Orlando',
  '32832': 'Orlando', '32835': 'Orlando',
  
  // Illinois
  '60601': 'Chicago', '60602': 'Chicago', '60603': 'Chicago',
  '60604': 'Chicago', '60605': 'Chicago', '60606': 'Chicago',
  '60607': 'Chicago', '60608': 'Chicago', '60609': 'Chicago',
  '60610': 'Chicago', '60611': 'Chicago', '60612': 'Chicago',
  '60613': 'Chicago', '60614': 'Chicago', '60615': 'Chicago',
  '60616': 'Chicago', '60617': 'Chicago', '60618': 'Chicago',
  '60619': 'Chicago', '60620': 'Chicago', '60621': 'Chicago',
  '60622': 'Chicago', '60623': 'Chicago', '60624': 'Chicago',
  '60625': 'Chicago', '60626': 'Chicago', '60628': 'Chicago',
  '60629': 'Chicago', '60630': 'Chicago', '60631': 'Chicago',
  '60632': 'Chicago', '60633': 'Chicago', '60634': 'Chicago',
  '60636': 'Chicago', '60637': 'Chicago', '60638': 'Chicago',
  '60639': 'Chicago', '60640': 'Chicago', '60641': 'Chicago',
  '60642': 'Chicago', '60643': 'Chicago', '60644': 'Chicago',
  '60645': 'Chicago', '60646': 'Chicago', '60647': 'Chicago',
  '60649': 'Chicago', '60651': 'Chicago', '60652': 'Chicago',
  '60653': 'Chicago', '60654': 'Chicago', '60655': 'Chicago',
  '60656': 'Chicago', '60657': 'Chicago', '60659': 'Chicago',
  '60660': 'Chicago', '60661': 'Chicago', '60706': 'Harwood Heights',
  '60707': 'Elmwood Park', '60714': 'Niles', '60803': 'Alsip'
};

// Map of state codes to common cities
const stateCityMap: Record<string, string> = {
  // ... keep existing code (state to city mapping)
};

/**
 * Greatly enhanced function to extract city names from various location string formats
 * Now prioritizes ZIP code lookup for more accurate city identification
 * 
 * @param location The location string from which to extract the city
 * @param fallback Fallback value (usually ZIP code) to use if extraction fails
 * @param debug Optional flag to enable debug logging
 * @returns The extracted city name
 */
export function extractCityFromLocation(location: string, fallback: string = 'Unknown', debug: boolean = false): string {
  if (!location || typeof location !== 'string') {
    if (debug) console.log(`[CityExtractor] Invalid location: "${location}", using fallback`);
    return extractCityFromZip(fallback) || fallback;
  }
  
  try {
    // Trim and normalize the location (remove extra spaces)
    const trimmedLocation = location.trim().replace(/\s+/g, ' ');
    
    if (debug) {
      console.log(`[CityExtractor] Processing: "${trimmedLocation}"`);
    }
    
    // First priority: Extract ZIP code from the location and look it up directly
    // This is now our preferred method as it's the most reliable
    const zipCodeRegex = /\b(\d{5}(-\d{4})?)\b/;
    const zipMatch = trimmedLocation.match(zipCodeRegex);
    
    if (zipMatch) {
      const zipCode = zipMatch[1];
      const cityFromZip = zipToCityMap[zipCode];
      
      if (cityFromZip) {
        if (debug) console.log(`[CityExtractor] Found via ZIP lookup: "${cityFromZip}" from ZIP: ${zipCode}`);
        return cityFromZip;
      }
    }
    
    // Format 1: "City, State ZIP" or "City, ST ZIP"
    // Example: "Los Angeles, CA 90001"
    const cityStateZipRegex = /^([^,]+),\s*([A-Z]{2})\s+(\d{5}(-\d{4})?)$/;
    const cityStateZipMatch = trimmedLocation.match(cityStateZipRegex);
    
    if (cityStateZipMatch) {
      const city = cityStateZipMatch[1].trim();
      if (debug) console.log(`[CityExtractor] Format 1 matched: "${city}"`);
      return city;
    }
    
    // Format 2: "Street, City, State ZIP"
    // Example: "123 Main St, Los Angeles, CA 90001"
    const streetCityStateZipRegex = /^.+,\s*([^,]+),\s*([A-Z]{2})\s+(\d{5}(-\d{4})?)$/;
    const streetCityStateZipMatch = trimmedLocation.match(streetCityStateZipRegex);
    
    if (streetCityStateZipMatch) {
      const city = streetCityStateZipMatch[1].trim();
      if (debug) console.log(`[CityExtractor] Format 2 matched: "${city}"`);
      return city;
    }
    
    // Format 3: "State ZIP" (with no city) - use state to city mapping
    // Example: "CA 90001"
    const stateZipRegex = /^([A-Z]{2})\s+(\d{5}(-\d{4})?)$/;
    const stateZipMatch = trimmedLocation.match(stateZipRegex);
    
    if (stateZipMatch) {
      const state = stateZipMatch[1];
      const zip = stateZipMatch[2];
      
      // First check if we can get city from ZIP
      if (zipToCityMap[zip.substring(0, 5)]) {
        const mappedCity = zipToCityMap[zip.substring(0, 5)];
        if (debug) console.log(`[CityExtractor] Format 3 ZIP lookup: "${mappedCity}"`);
        return mappedCity;
      }
      
      // Fall back to state lookup
      if (stateCityMap[state]) {
        const stateCity = stateCityMap[state];
        if (debug) console.log(`[CityExtractor] Format 3 state lookup: "${stateCity}"`);
        return stateCity;
      }
    }
    
    // Format 4: "City, State" with no ZIP
    // Example: "Seattle, WA"
    const cityStateRegex = /^([^,]+),\s*([A-Z]{2})$/;
    const cityStateMatch = trimmedLocation.match(cityStateRegex);
    
    if (cityStateMatch) {
      const city = cityStateMatch[1].trim();
      if (debug) console.log(`[CityExtractor] Format 4 matched: "${city}"`);
      return city;
    }
    
    // Format 5: Check for "City State ZIP" without commas
    // Example: "Los Angeles CA 90001"
    const cityStateZipNoCommaRegex = /^([A-Za-z\s.]+)\s+([A-Z]{2})\s+(\d{5}(-\d{4})?)$/;
    const cityStateZipNoCommaMatch = trimmedLocation.match(cityStateZipNoCommaRegex);
    
    if (cityStateZipNoCommaMatch) {
      const city = cityStateZipNoCommaMatch[1].trim();
      if (debug) console.log(`[CityExtractor] Format 5 matched: "${city}"`);
      return city;
    }
    
    // Format 6: Multi-part address with city in middle
    // Split by commas and examine each part
    const parts = trimmedLocation.split(',').map(part => part.trim());
    
    // If we have 3 or more parts, check the second to last part for a city
    if (parts.length >= 3) {
      // Second to last part is often the city
      const potentialCity = parts[parts.length - 2];
      
      // If it doesn't contain digits (to avoid ZIP codes), use it
      if (!/\d/.test(potentialCity)) {
        if (debug) console.log(`[CityExtractor] Format 6 matched: "${potentialCity}"`);
        return potentialCity;
      }
    }
    
    // Format 7: If we just have two parts, assume first is city (when no street address)
    // Example: "San Francisco, CA"
    if (parts.length === 2) {
      const potentialCity = parts[0];
      if (!/\d/.test(potentialCity)) {
        if (debug) console.log(`[CityExtractor] Format 7 matched: "${potentialCity}"`);
        return potentialCity;
      }
    }
    
    // Format 8: Simple city name (no state/ZIP)
    // Example: "Chicago"
    if (parts.length === 1 && !/\d/.test(parts[0]) && parts[0].length > 2) {
      if (debug) console.log(`[CityExtractor] Format 8 matched: "${parts[0]}"`);
      return parts[0];
    }
    
    // Format 9: Check if any part looks like a city (no numbers, not a state code)
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      // If the part has no digits and is not a state code, it's likely a city
      if (part.length > 2 && !/\d/.test(part) && !/^[A-Z]{2}$/.test(part)) {
        if (debug) console.log(`[CityExtractor] Format 9 matched: "${part}"`);
        return part;
      }
    }
    
    // If we get here, handle fallback to ZIP code
    return extractCityFromZip(fallback) || fallback;
    
  } catch (error) {
    console.error("[CityExtractor] Error extracting city:", error);
    return extractCityFromZip(fallback) || fallback;
  }
}

/**
 * Helper function to extract city from a ZIP code string
 * @param zipString String that might contain a ZIP code
 * @returns City name if found, undefined otherwise
 */
function extractCityFromZip(zipString: string): string | undefined {
  if (!zipString) return undefined;
  
  // Extract ZIP code if it's embedded in text
  const zipCodeRegex = /\b(\d{5}(-\d{4})?)\b/;
  const zipMatch = zipString.match(zipCodeRegex);
  
  if (zipMatch && zipMatch[1]) {
    // Get just the 5-digit ZIP
    const zipCode = zipMatch[1].substring(0, 5);
    return zipToCityMap[zipCode];
  }
  
  return undefined;
}
