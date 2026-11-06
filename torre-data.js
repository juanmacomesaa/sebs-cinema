// La Torre — catálogo de consignas y modo secreto.
// Categorías generadas sin inventar créditos: en el duelo los jugadores arbitran.
const actors=['Robert De Niro','Zendaya','Leonardo DiCaprio','Brad Pitt','Al Pacino','Meryl Streep','Tom Hanks','Emma Stone','Ryan Gosling','Margot Robbie','Cillian Murphy','Florence Pugh','Timothée Chalamet','Saoirse Ronan','Joaquin Phoenix','Natalie Portman','Scarlett Johansson','Samuel L. Jackson','Denzel Washington','Morgan Freeman','Christian Bale','Anne Hathaway','Jake Gyllenhaal','Amy Adams','Cate Blanchett','Tilda Swinton','Willem Dafoe','Adam Driver','Pedro Pascal','Oscar Isaac','Andrew Garfield','Tobey Maguire','Tom Holland','Hugh Jackman','Harrison Ford','Keanu Reeves','Winona Ryder','Johnny Depp','Helena Bonham Carter','Daniel Day-Lewis','Ralph Fiennes','Gary Oldman','Benedict Cumberbatch','Michael Caine','Matt Damon','Ben Affleck','George Clooney','Julia Roberts','Sandra Bullock','Nicole Kidman','Charlize Theron','Viola Davis','Lupita Nyong’o','Michelle Yeoh','Jackie Chan','Bruce Lee','Tony Leung','Song Kang-ho','Toni Collette','Paul Mescal','Colin Farrell','Brendan Fraser','Austin Butler','Robert Pattinson','Kristen Stewart','Jennifer Lawrence','Javier Bardem','Penélope Cruz','Antonio Banderas','Ricardo Darín','Guillermo Francella','Mercedes Morán','Érica Rivas','Dolores Fonzi','Gael García Bernal','Diego Luna','Salma Hayek','Ethan Hawke','Uma Thurman','John Travolta','Bruce Willis','Arnold Schwarzenegger','Sylvester Stallone','Sigourney Weaver','Jamie Lee Curtis','Kirsten Dunst','Bill Murray','Steve Carell','Jim Carrey','Robin Williams','Eddie Murphy','Will Smith','Chris Rock','Donald Glover','Jason Schwartzman','Adrien Brody','Jesse Plemons','Mark Ruffalo','Edward Norton','Michael Keaton','Michael B. Jordan','Zendaya'];
const directors=['Martin Scorsese','Steven Spielberg','Christopher Nolan','Quentin Tarantino','David Fincher','Wes Anderson','Greta Gerwig','Sofia Coppola','Denis Villeneuve','Bong Joon-ho','Park Chan-wook','Guillermo del Toro','Alfonso Cuarón','Alejandro G. Iñárritu','Pedro Almodóvar','Stanley Kubrick','Francis Ford Coppola','David Lynch','Paul Thomas Anderson','Ridley Scott','James Cameron','Peter Jackson','George Miller','Hayao Miyazaki','Isao Takahata','Makoto Shinkai','Tim Burton','Robert Zemeckis','Billy Wilder','Alfred Hitchcock','Akira Kurosawa','Federico Fellini','Ingmar Bergman','Andrei Tarkovsky','Agnès Varda','Céline Sciamma','Yorgos Lanthimos','Luca Guadagnino','Richard Linklater','Noah Baumbach','Damien Chazelle','Jordan Peele','Ari Aster','Robert Eggers','Sean Baker','Barry Jenkins','Chloé Zhao','Jane Campion','Emerald Fennell','Kathryn Bigelow','Spike Lee','Wong Kar-wai','Hirokazu Kore-eda','Ryusuke Hamaguchi','Nuri Bilge Ceylan','Michael Haneke','Lars von Trier','Gaspar Noé','Lucrecia Martel','Damián Szifron','Juan José Campanella','Pablo Larraín','Sebastián Lelio','Maite Alberdi','Walter Salles','Fernando Meirelles'];
const genres=['terror','comedia','drama','romance','acción','aventuras','ciencia ficción','fantasía','thriller','misterio','animación','musical','documental','western','crimen','bélico','deportes','histórico','familiar','superhéroes'];
const places=['Nueva York','París','Londres','Los Ángeles','Tokio','Roma','Buenos Aires','Santiago de Chile','Berlín','México','Chicago','San Francisco','Las Vegas','el espacio','un colegio','una universidad','un hospital','una prisión','un hotel','un tren','un barco','una isla','un pueblo pequeño','un restaurante','una casa embrujada','un aeropuerto','un desierto','una montaña','un bosque','una playa','un futuro distópico','el pasado','una guerra','una boda','una fiesta','un viaje por carretera','un juicio','una competencia','una oficina','una estación de policía'];
const themes=['una amistad central','un vínculo entre hermanos','un romance imposible','un triángulo amoroso','un robo','una investigación policial','un asesinato','un viaje en el tiempo','una inteligencia artificial','una identidad falsa','una familia disfuncional','una relación entre padres e hijos','una venganza','una desaparición','un secuestro','una catástrofe','una invasión extraterrestre','un animal importante','una mascota','una banda musical','un artista','una enfermedad','un personaje que cambia de ciudad','una historia de crecimiento personal','una amistad entre generaciones','una conspiración','una competición deportiva','una crisis de pareja','una historia de supervivencia','una celebración','una traición','un secreto familiar','un personaje que escribe','un personaje que cocina','un personaje que enseña','un personaje que conduce','un personaje que canta','un personaje que baila','un personaje que pinta','un personaje que actúa','un personaje que viaja'];
const words=['amor','muerte','vida','noche','día','hombre','mujer','niño','niña','casa','ciudad','mundo','tiempo','último','primero','rey','reina','guerra','paz','familia','corazón','secreto','sueño','historia','juego','estrella','luna','sol','perro','gato','agua','fuego','rojo','negro','blanco','azul','verde','oro','gran','pequeño','dos','tres','cuatro','cinco','siete','diez','uno','mil','hotel','calle','viaje','tren','verano','invierno','primavera','otoño','fantasma','monstruo','doctor','profesor','amigo','amiga','padre','madre','hermano','hermana','hijo','hija','chica','chico','última','primer','nuevo','viejo','feliz','triste','oscuro','largo','corto','mar','tierra','cielo','puerta','ventana','habitación','retrato','memoria','recuerdo','silencio','voz','música','canción','baile','película','cine','camino','destino','planeta','animal','isla','bosque','nieve','lluvia','viento','flor'];
const categories=[];
const famousActors=new Set(actors.slice(0,65).concat(['Ricardo Darín','Guillermo Francella','Penélope Cruz','Javier Bardem','Antonio Banderas','Tom Cruise','Will Smith']));
const add=(label,family,difficulty='Media',examples=[],aliases=[])=>categories.push({id:'torre-'+categories.length,label,family,difficulty,examples,aliases});
actors.filter(a=>famousActors.has(a)).forEach(a=>add('Películas en las que actúa '+a,'Reparto'));

directors.forEach(d=>add('Películas dirigidas por '+d,'Dirección'));
for(let year=2010;year<=2026;year++)add('Películas estrenadas en '+year,'Años','Difícil');
for(let decade=1920;decade<=2020;decade+=10)add('Películas estrenadas en los años '+decade,'Épocas');
genres.forEach(g=>{add('Películas del género '+g,'Géneros');add('Películas que mezclan '+g+' y drama','Géneros','Difícil');add('Películas que mezclan '+g+' y comedia','Géneros','Difícil')});
places.filter(p=>!['Nueva York','París','Londres','Los Ángeles','Tokio','Roma','Buenos Aires','Santiago de Chile','Berlín','México','Chicago','San Francisco','Las Vegas'].includes(p)).forEach(p=>add('Películas ambientadas principalmente en '+p,'Lugares'));
themes.forEach(t=>add('Películas con '+t,'Tramas'));
words.forEach(w=>{add('Películas que tienen la palabra «'+w+'» en el título','Títulos');add('Películas cuyo título original contiene «'+w+'»','Títulos','Difícil')});
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l=>{add('Películas cuyo título empieza con '+l,'Títulos');add('Películas cuyo título original empieza con '+l,'Títulos','Difícil');add('Películas con un personaje cuyo nombre empieza con '+l,'Personajes','Difícil')});
for(let n=1;n<=40;n++){add('Películas con exactamente '+n+' palabras en el título','Títulos','Difícil');add('Películas con un número '+n+' en el título','Títulos','Difícil')}
for(let n=1;n<=30;n++)add('Películas con al menos '+n+' personajes importantes','Personajes','Difícil');
for(const g of genres)for(const p of places.slice(13,33))add('Películas del género '+g+' ambientadas en '+p,'Cruces','Experto');
const extras=[
['Películas cuyo título contiene un número','Títulos',['Se7en','12 Angry Men','2001: A Space Odyssey'],['número en el título','numero','numeros']],
['Películas con viajes en el tiempo','Tramas',['Back to the Future','About Time','Predestination'],['viajes temporales','viaje en el tiempo']],
['Películas protagonizadas por un animal','Personajes',['Babe','Hachi: A Dog’s Tale','The Lion King'],['animales protagonistas','animal']],
['Películas con una boda importante','Tramas',['The Godfather','Four Weddings and a Funeral','My Best Friend’s Wedding'],['boda','bodas']],
['Películas de animación stop motion','Técnicas',['Coraline','Fantastic Mr. Fox','The Nightmare Before Christmas'],['stop motion','animación stop motion']],
['Películas donde el protagonista es músico','Personajes',['Whiplash','La La Land','Inside Llewyn Davis'],['músicos','musico']],
['Películas que transcurren en un hotel','Lugares',['The Grand Budapest Hotel','The Shining','Lost in Translation'],['hotel','hoteles']],
['Películas con inteligencia artificial','Tramas',['Her','Ex Machina','A.I. Artificial Intelligence'],['inteligencia artificial','ia']],
['Películas de robos o atracos','Tramas',['Ocean’s Eleven','Heat','Inside Man'],['robos','atracos']],
['Películas ambientadas en el espacio','Lugares',['Interstellar','Gravity','2001: A Space Odyssey'],['espacio','espaciales']],
['Películas con una historia de venganza','Tramas',['Kill Bill: Vol. 1','Oldboy','The Revenant'],['venganza']],
['Películas basadas en hechos reales','Producción',['Oppenheimer','The Social Network','Schindler’s List'],['hechos reales']],
['Películas con juicios','Tramas',['12 Angry Men','A Few Good Men','Anatomy of a Fall'],['juicios','juicio']],
['Películas sobre cocina o restaurantes','Tramas',['Ratatouille','The Menu','Chef'],['cocina','restaurantes']],
['Películas con protagonistas detectives','Personajes',['Se7en','Knives Out','Zodiac'],['detectives','detective']],
['Películas de superhéroes','Géneros',['The Dark Knight','Spider-Man','Iron Man'],['superheroes']],
['Películas musicales','Géneros',['La La Land','Chicago','Moulin Rouge!'],['musical','musicales']],
['Películas en blanco y negro','Técnicas',['Casablanca','The Artist','Roma'],['blanco y negro']],
['Películas con una isla importante','Lugares',['Shutter Island','Cast Away','The Lighthouse'],['isla','islas']],
['Películas sobre boxeo','Deportes',['Rocky','Raging Bull','Million Dollar Baby'],['boxeo']],
['Películas de ciencia ficción distópica','Géneros',['Blade Runner','The Hunger Games','Children of Men'],['distopia','distopía']],
['Películas con un tren importante','Lugares',['Snowpiercer','Murder on the Orient Express','Train to Busan'],['trenes','tren']],
['Películas con un asesino serial','Tramas',['Se7en','Zodiac','The Silence of the Lambs'],['asesino serial','asesinos seriales']],
['Películas con un protagonista periodista','Personajes',['Spotlight','The Post','All the President’s Men'],['periodistas','periodista']],
['Películas con viajes por carretera','Tramas',['Little Miss Sunshine','Thelma & Louise','Green Book'],['road movie','viajes en carretera']],
['Películas con dinosaurios','Personajes',['Jurassic Park','The Lost World: Jurassic Park','The Good Dinosaur'],['dinosaurios']],
['Películas sobre el cine','Tramas',['Cinema Paradiso','The Fabelmans','Babylon'],['cine','metacine']],
['Películas con protagonistas profesores','Personajes',['Dead Poets Society','School of Rock','The Holdovers'],['profesores','profesor']],
['Películas con vampiros','Personajes',['Nosferatu','Twilight','Only Lovers Left Alive'],['vampiros']],
['Películas con fantasmas','Personajes',['Ghost','The Sixth Sense','Beetlejuice'],['fantasmas']]
];
extras.forEach(([label,family,examples,aliases])=>add(label,family,'Media',examples,aliases));
// Duel deck: curated, understandable categories; never pad with arbitrary prompts.
const curated=[];
const include=(entries,limit)=>{for(const entry of entries.slice(0,limit))if(!curated.includes(entry))curated.push(entry)};
const by=(family,condition=()=>true)=>categories.filter(c=>c.family===family&&condition(c));
include(by('Reparto'),60);
include(by('Dirección',c=>['Christopher Nolan','Wes Anderson','Peter Jackson'].some(name=>c.label.endsWith(name))),3);
include(by('Años'),17);
const familiarGenres=new Set(['drama','comedia','terror','romance','acción','ciencia ficción','fantasía','thriller','animación','musical','crimen','aventuras']);
include(by('Géneros',c=>familiarGenres.has(c.label.replace('Películas del género ',''))),12);
include(by('Tramas'),41);
include(by('Títulos',c=>c.label.startsWith('Películas que tienen la palabra «')),100);
include(by('Títulos',c=>/^Películas cuyo título empieza con [A-Z]$/.test(c.label)),26);
const special=[
'Películas que transcurren durante un solo día',
'Películas donde la música es fundamental para la historia',
'Películas que rompen la cuarta pared',
'Películas con una narración no lineal',
'Películas donde la identidad del protagonista es un misterio',
'Películas sobre hacer cine',
'Películas con un narrador poco confiable',
'Películas que cuentan la misma historia desde distintas perspectivas',
'Películas con un final abierto',
'Películas con un protagonista que vive una doble vida',
'Películas con una historia dentro de otra historia',
'Películas donde se repite el mismo día',
'Películas con personajes que intercambian cuerpos',
'Películas que tienen una película dentro de la película',
'Películas con una escena de juicio decisiva',
'Películas donde el protagonista habla directamente a cámara',
'Películas donde dos desconocidos pasan el día juntos',
'Películas con un personaje que descubre un secreto sobre su identidad',
'Películas donde un objeto cambia de dueño varias veces',
'Películas donde el protagonista vuelve a su pueblo natal'
];
special.forEach(label=>curated.push({id:'especial-'+curated.length,label,family:'Conexiones especiales',difficulty:'Media',examples:[],aliases:[]}));
include(categories.filter(c=>c.examples.length>=3&&!curated.includes(c)&&!c.label.includes('ambientadas en ')&&!c.label.includes('transcurren en un hotel')&&!c.label.includes('isla importante')&&!c.label.includes('tren importante')),300-curated.length);
export const TORRE_CATEGORIES=curated.slice(0,300);
// Secret mode uses only categories objectively checkable against TMDB movie metadata.
export const TORRE_SECRET=categories.filter(c=>c.family==='Reparto'||c.family==='Dirección'&&['Christopher Nolan','Wes Anderson','Peter Jackson'].some(name=>c.label.endsWith(name))||c.family==='Años'||c.family==='Géneros'&&familiarGenres.has(c.label.replace('Películas del género ',''))||c.family==='Títulos'&&(/tienen la palabra/.test(c.label)||/título contiene un número/.test(c.label)||/título empieza con/.test(c.label)));

