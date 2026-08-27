// Extra knowledge about Damien that has no place in the displayed resume but
// enriches the conversational AI. Free-form French facts, one bullet per
// entry — edit this file directly to teach the assistant something new.
// Keep it factual: the system prompt forbids the model from inventing, so
// anything missing here is answered with "je ne sais pas".

export const EXTRA_FACTS: string[] = [
  // Formation
  'Formation : diplôme d\'ingénieur en informatique de Polytech Tours (2009-2012), précédé d\'un BTS Informatique Industriel au lycée Alfred Kastler (2007-2009).',

  // Parcours avant Dedalus (~14 ans d'expérience au total depuis 2012)
  'Carrière démarrée en 2012 : environ 14 ans d\'expérience en développement au total, dont près de 10 ans chez Dedalus.',
  'Développeur Java chez Atos (juin 2012 - août 2015, région de Blois) : développement d\'une plateforme de paiement bancaire pour la gestion de cartes prépayées.',
  'Consultant chez ARCA Computing (2015-2016, région bordelaise) avec trois missions : backend Java de Fairitycs, une solution à base de beacons (ARCA) ; full stack sur une application web de transport collaboratif (4SH France) ; développement frontend de composants JS/CSS compatibles avec le logiciel Uniface chez Agfa HealthCare (nov. 2015 - sept. 2016) — sa première expérience dans la santé, avant de rejoindre Dedalus en septembre 2016.',

  // Rôle actuel élargi
  'Depuis janvier 2026, nommé AI Champion officiel du groupe Dedalus : il représente et pilote l\'adoption de l\'IA à l\'échelle du groupe, en parallèle de son rôle de Technical Lead Manager.',

  // Activité indépendante (en parallèle du CDI Dedalus)
  'En CDI chez Dedalus, et depuis 2026 également fondateur de BATTISTELLA (https://pro.battistella.ovh/), micro-entreprise indépendante : un studio solo qui conçoit, héberge (en France, auto-hébergé) et exploite ses propres applications SaaS — The Box, Toko, WaWPTN, Tribu, Copro-Pilot (gratuit, freemium ou abonnement de 3,99 € à 149 €/mois selon le produit). Pas de prestations sur mesure : il se concentre exclusivement sur ses propres produits.',

  // Langues
  'Langues : français (natif) ; parle et comprend l\'anglais.',

  // Localisation & réseau
  'Basé à Artigues-près-Bordeaux (région bordelaise) ; travaille en mode hybride chez Dedalus.',
  'Très favorable au télétravail, qu\'il préfère : il le pratique 3 jours par semaine chez Dedalus depuis plusieurs années.',
  'Plus de 500 relations sur LinkedIn.',

  // Vie personnelle (le site mentionne déjà famille, rénovation et domotique)
  'Marié et père de deux enfants.'
]
