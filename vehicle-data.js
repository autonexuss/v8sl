// Editorial India-market directory for car-only search and planner dropdowns.
// Year windows are approximate model-family availability, not VIN/registration data.
(() => {
  const raw = [
    { make:'Abarth', aliases:[], url:'https://www.fiat-india.com/', models:[['595',2015,2021],['124 Spider',2017,2020]] },
    { make:'Audi', aliases:[], url:'https://www.audi.in/', models:[['A3',2014,2021],['A4',2008,2026],['A6',2005,2026],['A8',2004,2026,['A8 L']],['Q2',2020,2022],['Q3',2012,2026],['Q5',2009,2026],['Q7',2006,2026],['Q8',2019,2026],['e-tron',2021,2023,['e-tron GT']],['Q8 e-tron',2023,2025],['TT',2008,2018],['R8',2008,2023]] },
    { make:'BMW', aliases:[], url:'https://www.bmw.in/', models:[['1 Series',2009,2013],['2 Series Gran Coupe',2020,2026],['3 Series',2007,2026,['3 Series Gran Limousine']],['5 Series',2007,2026],['6 Series Gran Turismo',2018,2023],['7 Series',2002,2026],['X1',2010,2026],['X3',2004,2026],['X4',2019,2023],['X5',2000,2026],['X6',2009,2026],['X7',2019,2026],['i4',2022,2026],['i7',2023,2026],['iX',2021,2026],['Z4',2003,2026]] },
    { make:'BYD', aliases:[], url:'https://www.byd.com/in', models:[['Atto 3',2022,2026],['e6',2021,2026],['Seal',2024,2026],['Sealion 7',2025,2026],['Sealion 6',2025,2026]] },
    { make:'Chevrolet', aliases:['Chevy'], url:'https://www.chevrolet.co.in/', models:[['Aveo',2006,2012],['Aveo U-VA',2006,2012],['Beat',2010,2017],['Captiva',2008,2017],['Cruze',2009,2017],['Enjoy',2013,2016],['Optra',2003,2012],['Sail',2012,2017],['Sail U-VA',2012,2017],['Spark',2007,2012],['Tavera',2004,2017],['Trailblazer',2015,2017]] },
    { make:'Citroën', aliases:['Citroen'], url:'https://www.citroen.in/', models:[['C3',2022,2026],['ë-C3',2023,2026,['e-C3']],['C3 Aircross',2023,2026,['Aircross']],['Basalt',2024,2026],['C5 Aircross',2021,2024],['Aircross X',2025,2026]] },
    { make:'Datsun', aliases:[], url:'https://www.nissan.in/', models:[['GO',2014,2022],['GO+',2015,2022],['redi-GO',2016,2022]] },
    { make:'Daewoo', aliases:[], url:'https://www.daewoo.com/', models:[['Cielo',1995,2000],['Matiz',1998,2002],['Nexia',1995,1998]] },
    { make:'DC', aliases:['DC Design'], url:'https://www.dcdesign.co.in/', models:[['Avanti',2015,2019]] },
    { make:'Fiat', aliases:[], url:'https://www.fiat-india.com/', models:[['Palio',2001,2010],['Petra',2002,2007],['Punto',2009,2018,['Punto Evo']],['Linea',2009,2018],['Grande Punto',2009,2014],['Punto Abarth',2015,2018],['Avventura',2014,2018],['Urban Cross',2016,2018]] },
    { make:'Force Motors', aliases:['Force'], url:'https://www.forcemotors.com/', models:[['Gurkha',2008,2026],['Trax',1990,2026,['Trax Cruiser']],['One',2011,2016],['Citiline',2023,2026]] },
    { make:'Ford', aliases:[], url:'https://www.india.ford.com/', models:[['Ikon',1999,2011],['Fiesta',2005,2014,['Fiesta Classic']],['Fusion',2004,2010],['Figo',2010,2021],['EcoSport',2013,2021],['Endeavour',2003,2021,['Everest']],['Aspire',2015,2021,['Figo Aspire']],['Freestyle',2018,2021],['Mustang',2016,2026],['Mondeo',2001,2006]] },
    { make:'Hindustan Motors', aliases:['Hindustan'], url:'https://www.hindmotor.com/', models:[['Ambassador',1958,2014],['Contessa',1984,2002]] },
    { make:'Honda', aliases:[], url:'https://www.hondacarindia.com/', models:[['Amaze',2013,2026],['Accord',2001,2016],['Brio',2011,2018],['BR-V',2016,2020],['City',1998,2026],['Civic',2006,2020],['CR-V',2003,2020],['Elevate',2023,2026],['Jazz',2009,2023],['Mobilio',2014,2017],['WR-V',2017,2023],['Prelude',1997,2001]] },
    { make:'Hyundai', aliases:[], url:'https://www.hyundai.com/in/en', models:[['Accent',1999,2013],['Alcazar',2021,2026],['Aura',2020,2026],['Creta',2015,2026,['Creta N Line']],['Eon',2011,2019],['Elantra',2004,2020],['Exter',2023,2026],['Getz',2004,2009],['Grand i10',2013,2023,['Grand i10 Nios']],['i10',2007,2017],['i20',2008,2026,['i20 Active']],['Ioniq 5',2023,2026],['Kona Electric',2019,2024,['Kona']],['Santro',1998,2022],['Santa Fe',2010,2017],['Sonata',2001,2015],['Tucson',2005,2026],['Venue',2019,2026,['Venue N Line']],['Verna',2006,2026],['Xcent',2014,2020],['Terracan',2002,2007]] },
    { make:'Isuzu', aliases:[], url:'https://www.isuzu.in/', models:[['D-Max',2012,2026],['D-Max V-Cross',2016,2026,['V-Cross']],['MU-7',2013,2017],['MU-X',2017,2026],['Hi-Lander',2021,2026],['S-Cab',2016,2026]] },
    { make:'Jaguar', aliases:[], url:'https://www.jaguar.in/', models:[['E-Pace',2018,2024],['F-Pace',2016,2026],['F-Type',2013,2024],['I-Pace',2020,2025],['XE',2015,2024],['XF',2008,2026],['XJ',2003,2019],['XK',2007,2014]] },
    { make:'Jeep', aliases:[], url:'https://www.jeep-india.com/', models:[['Compass',2017,2026],['Grand Cherokee',2009,2026],['Meridian',2022,2026],['Wrangler',2009,2026],['Cherokee',2009,2014]] },
    { make:'Kia', aliases:[], url:'https://www.kia.com/in/home.html', models:[['Carens',2022,2026,['Carens Clavis']],['Carnival',2020,2026],['EV6',2022,2026],['EV9',2024,2026],['Seltos',2019,2026],['Sonet',2020,2026],['Syros',2025,2026]] },
    { make:'Land Rover', aliases:['Range Rover'], url:'https://www.landrover.in/', models:[['Defender',1990,2026],['Discovery',1990,2026],['Discovery Sport',2015,2026],['Freelander 2',2007,2015,['Freelander']],['Range Rover',1995,2026],['Range Rover Evoque',2011,2026,['Evoque']],['Range Rover Sport',2005,2026],['Range Rover Velar',2017,2026,['Velar']]] },
    { make:'Lexus', aliases:[], url:'https://www.lexusindia.co.in/', models:[['ES',2017,2026],['LS',2017,2026],['LC 500h',2019,2024,['LC']],['LM',2024,2026],['LX',2017,2026],['NX',2017,2026],['RX',2017,2026]] },
    { make:'Mahindra', aliases:['Mahindra & Mahindra'], url:'https://auto.mahindra.com/', models:[['Alturas G4',2018,2022],['Bolero',2000,2026],['Bolero Neo',2021,2026],['e2o',2013,2016,['e2o Plus']],['KUV100',2016,2020],['Marazzo',2018,2026],['Scorpio',2002,2026,['Scorpio Classic']],['Scorpio-N',2022,2026,['Scorpio N']],['Thar',2010,2026],['Thar Roxx',2024,2026],['TUV300',2015,2021],['XUV300',2019,2024,['XUV 3XO']],['XUV400',2023,2026,['XUV400 EV']],['XUV500',2011,2021],['XUV700',2021,2026],['Quanto',2012,2016],['Verito',2011,2020],['Xylo',2009,2019],['Jeeto',2015,2026]] },
    { make:'Maruti Suzuki', aliases:['Maruti','Suzuki'], url:'https://www.marutisuzuki.com/', models:[['800',1983,2014,['Maruti 800']],['A-Star',2008,2014],['Alto',2000,2022,['Alto 800']],['Alto K10',2010,2026],['Baleno',2015,2026],['Brezza',2016,2026,['Vitara Brezza']],['Celerio',2014,2026],['Ciaz',2014,2026],['Dzire',2008,2026,['Swift Dzire']],['Eeco',2010,2026],['Ertiga',2012,2026],['Fronx',2023,2026],['Grand Vitara',2003,2026],['Gypsy',1985,2019],['Ignis',2017,2026],['Jimny',2023,2026],['Kizashi',2011,2014],['Omni',1984,2019],['Ritz',2009,2015],['S-Cross',2015,2022],['S-Presso',2019,2026],['Swift',2005,2026],['SX4',2007,2013],['Wagon R',1999,2026],['XL6',2019,2026],['Zen',1993,2006,['Zen Estilo']]] },
    { make:'Maserati', aliases:[], url:'https://www.maserati.com/in/en', models:[['Ghibli',2014,2024],['GranCabrio',2011,2026],['GranTurismo',2007,2026],['Grecale',2022,2026],['Levante',2016,2024],['Quattroporte',2004,2026]] },
    { make:'Mercedes-Benz', aliases:['Mercedes','Mercedes Benz','Mercedes-AMG','Mercedes-Maybach','Benz'], url:'https://www.mercedes-benz.co.in/', models:[['A-Class',2013,2022,['A-Class Limousine','A 45 S','AMG A 45 S']],['B-Class',2012,2016],['C-Class',2001,2026],['CLA',2015,2020],['CLS',2006,2022],['E-Class',1995,2026],['G-Class',2001,2026,['G 63']],['GLA',2014,2026],['GLB',2020,2026],['GLC',2016,2026],['GLE',2015,2026,['ML-Class']],['GLS',2007,2026],['AMG GT',2015,2026],['S-Class',1995,2026],['V-Class',2019,2022],['EQB',2022,2026],['EQE',2023,2026],['EQS',2022,2026],['Maybach GLS',2021,2026,['Mercedes-Maybach GLS 600']],['Maybach S-Class',2015,2026,['Mercedes-Maybach S 600','Mercedes-Maybach S 680']]] },
    { make:'MG', aliases:['Morris Garages','MG Motor'], url:'https://www.mgmotor.co.in/', models:[['Astor',2021,2026],['Comet EV',2023,2026,['Comet']],['Gloster',2020,2026],['Hector',2019,2026],['Hector Plus',2020,2026],['ZS EV',2020,2026],['Windsor EV',2024,2026],['Cyberster',2025,2026]] },
    { make:'Mini', aliases:['MINI'], url:'https://www.mini.in/', models:[['3-Door',2012,2026,['Cooper']],['5-Door',2015,2026],['Convertible',2012,2026],['Countryman',2012,2026],['Clubman',2013,2020],['JCW',2015,2026,['John Cooper Works']]] },
    { make:'Mitsubishi', aliases:[], url:'https://www.mitsubishi-motors.com/en/', models:[['Cedia',2006,2013],['Lancer',1998,2012],['Montero',2006,2016],['Outlander',2008,2013],['Pajero',2002,2012],['Pajero Sport',2012,2020],['Eclipse Cross',2022,2024]] },
    { make:'Nissan', aliases:[], url:'https://www.nissan.in/', models:[['Kicks',2019,2023],['Magnite',2020,2026],['Micra',2010,2020],['Sunny',2011,2020],['Terrano',2013,2020],['X-Trail',2005,2026],['Teana',2007,2014],['Evalia',2012,2015]] },
    { make:'Opel', aliases:[], url:'https://www.opel.com/', models:[['Astra',1996,2003],['Corsa',2000,2006],['Vectra',2002,2005]] },
    { make:'Porsche', aliases:[], url:'https://www.porsche.com/middle-east/_india_/', models:[['718 Boxster',2016,2026,['Boxster']],['718 Cayman',2016,2026,['Cayman']],['911',1995,2026],['Cayenne',2003,2026],['Macan',2014,2026],['Panamera',2009,2026],['Taycan',2020,2026]] },
    { make:'Premier', aliases:['Premier Automobiles'], url:'https://www.premier.co.in/', models:[['Padmini',1964,2000],['Rio',2009,2016]] },
    { make:'Renault', aliases:[], url:'https://www.renault.co.in/', models:[['Captur',2017,2020],['Duster',2012,2022,['Duster Turbo']],['Fluence',2011,2016],['Kiger',2021,2026],['Kwid',2015,2026],['Lodgy',2015,2020],['Triber',2019,2026]] },
    { make:'Škoda', aliases:['Skoda'], url:'https://www.skoda-auto.co.in/', models:[['Fabia',2008,2013],['Kodiaq',2017,2026],['Kushaq',2021,2026],['Octavia',2001,2026],['Rapid',2011,2021],['Slavia',2022,2026],['Superb',2004,2026],['Yeti',2010,2017]] },
    { make:'SsangYong', aliases:['Mahindra SsangYong'], url:'https://www.kgm-global.com/', models:[['Rexton',2012,2018],['Korando',2012,2015]] },
    { make:'Tata', aliases:['Tata Motors'], url:'https://cars.tatamotors.com/', models:[['Altroz',2020,2026],['Aria',2010,2017],['Bolt',2014,2019],['Curvv',2024,2026,['Curvv EV']],['Harrier',2019,2026],['Hexa',2017,2020],['Indica',1998,2018],['Indigo',2002,2018],['Manza',2009,2016],['Nano',2009,2018],['Nexon',2017,2026,['Nexon EV']],['Punch',2021,2026,['Punch EV']],['Safari',1998,2026],['Sierra',2025,2026],['Sumo',1994,2019],['Tiago',2016,2026,['Tiago EV']],['Tigor',2017,2026,['Tigor EV']],['Zest',2014,2019]] },
    { make:'Toyota', aliases:['Toyota Kirloskar'], url:'https://www.toyotabharat.com/', models:[['Camry',2002,2026],['Corolla',1996,2020,['Corolla Altis']],['Etios',2010,2020,['Etios Liva']],['Fortuner',2009,2026],['Glanza',2019,2026],['Hilux',2008,2026],['Innova',2005,2026,['Innova Crysta']],['Innova Hycross',2022,2026],['Land Cruiser',2000,2026,['Land Cruiser 300']],['Land Cruiser Prado',2003,2018,['Prado']],['Rumion',2023,2026],['Urban Cruiser',2020,2022],['Urban Cruiser Hyryder',2022,2026,['Hyryder']],['Vellfire',2019,2026],['Yaris',2018,2021],['Taisor',2024,2026]] },
    { make:'Volkswagen', aliases:['VW'], url:'https://www.volkswagen.co.in/', models:[['Ameo',2016,2020],['Beetle',2009,2015],['Cross Polo',2013,2017],['Jetta',2008,2018],['Passat',2007,2018],['Polo',2010,2022],['Taigun',2021,2026],['Tiguan',2017,2026],['T-Roc',2020,2021],['Vento',2010,2022]] },
    { make:'Volvo', aliases:[], url:'https://www.volvocars.com/in/', models:[['C30',2007,2013],['S60',2010,2026],['S80',2007,2015],['S90',2016,2026],['V40',2013,2019],['XC40',2018,2026,['EX40']],['XC60',2009,2026],['XC90',2003,2026],['C40 Recharge',2022,2025,['EC40']],['EX30',2024,2026],['EX40',2024,2026]] }
  ];

  const directory = raw.map(item => ({
    ...item,
    models: item.models.map(([name, from, to, aliases = []]) => ({ name, from, to, aliases }))
  }));
  const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const makeNames = make => [make.make, ...(make.aliases || [])];
  const findMake = value => directory.find(make => makeNames(make).some(name => norm(name) === norm(value))) || null;
  const matchCar = value => {
    // Let visitors include the year before the make/model (for example,
    // "2024 Hyundai Creta") while keeping the original term for year-aware
    // photo/specification matching elsewhere in the page.
    const query = norm(value).replace(/^(?:19|20)\d{2}\s+/, '');
    if (!query) return null;
    for (const make of directory) for (const model of make.models) {
      const candidates = [model.name, ...(model.aliases || [])].map(name => norm(name));
      const fullCandidates = candidates.flatMap(name => [norm(`${make.make} ${name}`), ...makeNames(make).map(alias => norm(`${alias} ${name}`))]);
      if (candidates.some(name => query === name || query.startsWith(name + ' ')) || fullCandidates.some(name => query === name || query.startsWith(name + ' '))) {
        return { make, model, fullName: `${make.make} ${model.name}` };
      }
    }
    return null;
  };
  const yearOptions = model => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: Math.max(0, Math.min(model.to, currentYear) - model.from + 1) }, (_, index) => model.from + index).reverse();
  };
  const fill = (select, options, placeholder, selected = '') => {
    select.replaceChildren(new Option(placeholder, ''));
    options.forEach(item => select.add(new Option(item.label, item.value)));
    select.value = selected;
    select.disabled = !options.length;
  };
  const bindPlanner = prefix => {
    const makeSelect = document.getElementById(`${prefix}-make`);
    const modelSelect = document.getElementById(`${prefix}-model`);
    const yearSelect = document.getElementById(`${prefix}-year`);
    if (!makeSelect || !modelSelect || !yearSelect) return;
    fill(makeSelect, directory.map(make => ({ label: make.make, value: make.make })), 'Choose a make');
    fill(modelSelect, [], 'Choose a make first');
    fill(yearSelect, [], 'Choose a model first');
    makeSelect.addEventListener('change', () => {
      const make = findMake(makeSelect.value);
      fill(modelSelect, (make?.models || []).map(model => ({ label: model.name, value: model.name })), make ? 'Choose a model' : 'Choose a make first');
      fill(yearSelect, [], 'Choose a model first');
    });
    modelSelect.addEventListener('change', () => {
      const model = findMake(makeSelect.value)?.models.find(item => item.name === modelSelect.value);
      fill(yearSelect, model ? yearOptions(model).map(year => ({ label: String(year), value: String(year) })) : [], model ? 'Choose a year' : 'Choose a model first');
    });
  };

  window.CHASSIS_INDIA_DIRECTORY = directory;
  window.chassisResolveCar = matchCar;
  window.chassisResolveMake = findMake;
  window.chassisBindPlanner = bindPlanner;
  window.chassisYearOptions = yearOptions;
})();


