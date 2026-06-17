const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_FILE = path.join(process.cwd(), 'POLLA MUNDIALERA FLIA.xlsx');
const DB_FILE = path.join(process.cwd(), 'db.json');
const MATCHES_FILE = path.join(process.cwd(), 'src', 'data', 'matches.json');
const USERS_FILE = path.join(process.cwd(), 'src', 'data', 'users.json');

const TEAM_MAP = {
  'MEXICO': 'México', 'SUDAFRICA': 'Sudáfrica', 'COREA': 'República de Corea', 'KOREA': 'República de Corea',
  'R. CHECA': 'República Checa', 'CHECA': 'República Checa', 'CANADA': 'Canadá', 'BOSNIA': 'Bosnia y Herzegovina',
  'USA': 'Estados Unidos', 'PARAGUAY': 'Paraguay', 'QATAR': 'Catar', 'SUIZA': 'Suiza',
  'BRASIL': 'Brasil', 'MARRUECOS': 'Marruecos', 'HAITI': 'Haití', 'ESCOCIA': 'Escocia',
  'AUSTRALIA': 'Australia', 'TURQUIA': 'Turquía', 'ALEMANIA': 'Alemania', 'CURACAO': 'Curazao',
  'HOLANDA': 'Países Bajos', 'JAPON': 'Japón', 'C. DE MARFIL': 'Costa de Marfil', 'ECUADOR': 'Ecuador',
  'SUECIA': 'Suecia', 'TUNEZ': 'Túnez', 'ESPAÑA': 'España', 'CABO VERDE': 'Cabo Verde',
  'BELGICA': 'Bélgica', 'EGIPTO': 'Egipto', 'ARABIA': 'Arabia Saudí', 'URUGUAY': 'Uruguay',
  'IRAN': 'República Islámica de Irán', 'NEVA ZELANDA': 'Nueva Zelanda', 'NUEVA ZELANDA': 'Nueva Zelanda',
  'FRANCIA': 'Francia', 'SENEGAL': 'Senegal', 'IRAK': 'Irak', 'NORUEGA': 'Noruega',
  'ARGENTINA': 'Argentina', 'ALGERIA': 'Argelia', 'ARGELIA': 'Argelia', 'AUSTRIA': 'Austria',
  'JORDANIA': 'Jordania', 'PORTUGAL': 'Portugal', 'CONGO': 'República Democrática del Congo',
  'INGLATERRA': 'Inglaterra', 'CROACIA': 'Croacia', 'GHANA': 'Ghana', 'PANAMA': 'Panamá',
  'UZBEKISTAN': 'Uzbekistán', 'COLOMBIA': 'Colombia'
};

const TEAM_GROUPS = {
  'México': 'Group A', 'Sudáfrica': 'Group A', 'República de Corea': 'Group A', 'República Checa': 'Group A',
  'Canadá': 'Group B', 'Bosnia y Herzegovina': 'Group B', 'Catar': 'Group B', 'Suiza': 'Group B',
  'Brasil': 'Group C', 'Marruecos': 'Group C', 'Haití': 'Group C', 'Escocia': 'Group C',
  'Estados Unidos': 'Group D', 'Paraguay': 'Group D', 'Australia': 'Group D', 'Turquía': 'Group D',
  'Alemania': 'Group E', 'Curazao': 'Group E', 'Costa de Marfil': 'Group E', 'Ecuador': 'Group E',
  'Países Bajos': 'Group F', 'Japón': 'Group F', 'Suecia': 'Group F', 'Túnez': 'Group F',
  'Bélgica': 'Group G', 'Egipto': 'Group G', 'República Islámica de Irán': 'Group G', 'Nueva Zelanda': 'Group G',
  'España': 'Group H', 'Cabo Verde': 'Group H', 'Arabia Saudí': 'Group H', 'Uruguay': 'Group H',
  'Francia': 'Group I', 'Senegal': 'Group I', 'Irak': 'Group I', 'Noruega': 'Group I',
  'Argentina': 'Group J', 'Argelia': 'Group J', 'Austria': 'Group J', 'Jordania': 'Group J',
  'Portugal': 'Group K', 'República Democrática del Congo': 'Group K', 'Uzbekistán': 'Group K', 'Colombia': 'Group K',
  'Inglaterra': 'Group L', 'Croacia': 'Group L', 'Ghana': 'Group L', 'Panamá': 'Group L'
};

const GROUP_DATES = {
  'Group A': '2026-06-24', 'Group B': '2026-06-24', 'Group C': '2026-06-25', 'Group D': '2026-06-25',
  'Group E': '2026-06-26', 'Group F': '2026-06-26', 'Group I': '2026-06-28', 'Group J': '2026-06-28',
  'Group H': '2026-06-27', 'Group G': '2026-06-27', 'Group K': '2026-06-29', 'Group L': '2026-06-29'
};

function cleanTeamName(name) {
  const upper = name.trim().toUpperCase();
  return TEAM_MAP[upper] || name.trim();
}

function getGroupForMatch(home, away) {
  return TEAM_GROUPS[home] || TEAM_GROUPS[away] || 'Group Stage';
}

function getMatchDateTime(matchId, group) {
  const originalDates = {
    1: '2026-06-11T15:00:00Z', 2: '2026-06-11T22:00:00Z',
    3: '2026-06-12T15:00:00Z', 4: '2026-06-12T21:00:00Z',
    5: '2026-06-13T15:00:00Z', 6: '2026-06-13T18:00:00Z', 7: '2026-06-13T21:00:00Z', 8: '2026-06-13T00:00:00Z',
    9: '2026-06-14T13:00:00Z', 10: '2026-06-14T16:00:00Z', 11: '2026-06-14T19:00:00Z', 12: '2026-06-14T22:00:00Z',
    13: '2026-06-15T12:00:00Z', 14: '2026-06-15T15:00:00Z', 15: '2026-06-15T18:00:00Z', 16: '2026-06-15T21:00:00Z',
    17: '2026-06-16T15:00:00Z', 18: '2026-06-16T18:00:00Z', 19: '2026-06-16T21:00:00Z', 20: '2026-06-16T00:00:00Z',
    21: '2026-06-17T13:00:00Z', 22: '2026-06-17T16:00:00Z', 23: '2026-06-17T19:00:00Z', 24: '2026-06-17T22:00:00Z',
    25: '2026-06-18T12:00:00Z', 26: '2026-06-18T15:00:00Z', 27: '2026-06-18T18:00:00Z', 28: '2026-06-18T21:00:00Z',
    29: '2026-06-19T15:00:00Z', 30: '2026-06-19T18:00:00Z', 31: '2026-06-19T21:00:00Z', 32: '2026-06-19T00:00:00Z',
    33: '2026-06-20T13:00:00Z', 34: '2026-06-20T16:00:00Z', 35: '2026-06-20T22:00:00Z', 36: '2026-06-20T00:00:00Z',
    37: '2026-06-21T12:00:00Z', 38: '2026-06-21T15:00:00Z', 39: '2026-06-21T18:00:00Z', 40: '2026-06-21T21:00:00Z',
    41: '2026-06-22T13:00:00Z', 42: '2026-06-22T17:00:00Z', 43: '2026-06-22T20:00:00Z', 44: '2026-06-22T23:00:00Z',
    45: '2026-06-23T13:00:00Z', 46: '2026-06-23T16:00:00Z', 47: '2026-06-23T19:00:00Z', 48: '2026-06-23T22:00:00Z'
  };

  if (matchId <= 48) {
    return originalDates[matchId];
  }

  const date = GROUP_DATES[group] || '2026-06-24';
  const time = (matchId % 2 === 0) ? '18:00:00Z' : '21:00:00Z';
  return `${date}T${time}`;
}

const workbook = xlsx.readFile(EXCEL_FILE);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

const familyMembers = ['ABUELO', 'ELY', 'CAR/ALVA', 'ANDRES', 'MATI', 'GONZI', 'KEKO', 'NENA', 'MARI', 'NICO', 'ALE', 'KYKE', 'LEO', 'MATE', 'SARICH', 'PAO', 'SEBAS'];

const matchesList = [];
const usersTemp = {};
familyMembers.forEach(m => {
  usersTemp[m] = [];
});

data.forEach((row, idx) => {
  const matchIdNum = idx + 1;
  const matchIdStr = `m${matchIdNum}`;
  const partido = String(row['PARTIDO']).trim();
  
  // Split partido into team names
  const cleanClean = partido.replace(/\s+/g, ' ').trim();
  const parts = cleanClean.split(/\s+[Vv][Ss]\s+/);
  let teamHome = cleanClean;
  let teamAway = '';
  if (parts.length === 2) {
    teamHome = cleanTeamName(parts[0]);
    teamAway = cleanTeamName(parts[1]);
  } else {
    console.warn(`Could not split match name cleanly: "${partido}". Using raw value.`);
  }

  const groupStage = getGroupForMatch(teamHome, teamAway);
  const matchDate = getMatchDateTime(matchIdNum, groupStage);

  matchesList.push({
    id: matchIdStr,
    team_home: teamHome,
    team_away: teamAway,
    group_stage: groupStage,
    match_date: matchDate,
    actual_home_score: null,
    actual_away_score: null,
    status: 'scheduled'
  });

  familyMembers.forEach(m => {
    let val = row[m];
    let valStr = val !== undefined && val !== null ? String(val).trim() : "0-0";
    let h = 0;
    let a = 0;
    if (valStr.includes('-')) {
      const p = valStr.split('-');
      h = parseInt(p[0]) || 0;
      a = parseInt(p[1]) || 0;
    } else {
      h = parseInt(valStr) || 0;
      a = 0;
    }

    usersTemp[m].push({
      match_id: matchIdStr,
      predicted_home_score: h,
      predicted_away_score: a,
      points_earned: null
    });
  });
});

const usersList = [];
familyMembers.forEach(m => {
  const cleanId = m.toLowerCase().replace('/', '_');
  usersList.push({
    id: cleanId,
    name: m,
    total_points: 0,
    betting_scores: usersTemp[m]
  });
});

const settings = {
  pointStructure: {
    exact_match_points: 3,
    correct_outcome_points: 1,
    loss_points: 0
  }
};

const fullDatabase = {
  settings,
  matches: matchesList,
  users: usersList
};

// Write files
fs.writeFileSync(DB_FILE, JSON.stringify(fullDatabase, null, 2), 'utf-8');
console.log('SUCCESS: db.json rewritten successfully.');

if (fs.existsSync(path.dirname(MATCHES_FILE))) {
  fs.writeFileSync(MATCHES_FILE, JSON.stringify(matchesList, null, 2), 'utf-8');
  fs.writeFileSync(USERS_FILE, JSON.stringify(usersList, null, 2), 'utf-8');
  console.log('SUCCESS: src/data matches.json and users.json written successfully.');
}
