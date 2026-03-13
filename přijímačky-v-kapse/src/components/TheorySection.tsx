import React, { useState } from 'react';
import { BookOpen, Calculator, ArrowLeft, ChevronRight, FileText, Lightbulb, BookText } from 'lucide-react';
import { motion } from 'motion/react';

interface TheorySectionProps {
  onBack: () => void;
}

const CZECH_THEORY = [
  {
    title: 'Větný rozbor',
    description: 'Základní skladební dvojice, rozvíjející větné členy, druhy vedlejších vět.',
    content: `
      Základní skladební dvojice:
      - Podmět (Kdo? Co?) - vyjadřuje původce děje.
      - Přísudek (Co dělá podmět?) - vyjadřuje děj, stav nebo vlastnost.

      Rozvíjející větné členy:
      - Přívlastek (Jaký? Který? Čí?) - rozvíjí podstatné jméno.
      - Předmět (Pádové otázky kromě 1. a 5. pádu) - rozvíjí sloveso nebo přídavné jméno.
      - Příslovečné určení (Kde? Kdy? Jak? Proč?) - rozvíjí sloveso, přídavné jméno nebo příslovce.

      Druhy vedlejších vět:
      - Podmětná (Kdo, co?)
      - Přísudková (Jaký je?)
      - Předmětná (Pádové otázky)
      - Přívlastková (Jaký, který, čí?)
      - Příslovečná (místní, časová, způsobová, příčinná, účelová, podmínková, přípustková)
    `
  },
  {
    title: 'Pravopisná pravidla',
    description: 'Psaní i/y, s/z, velká písmena, interpunkce.',
    content: `
      Psaní i/y:
      - Vyjmenovaná slova a slova příbuzná.
      - Koncovky podstatných a přídavných jmen (vzory).
      - Shoda přísudku s podmětem.

      Psaní s/z:
      - Předpony s- (směr dohromady, shora dolů, zmenšení objemu).
      - Předpony z- (změna stavu, dokončení děje).
      - Předpony vz- (směr nahoru).

      Velká písmena:
      - Vlastní jména osob, zvířat, měst, států, hor, řek.
      - Názvy institucí, svátků, uměleckých děl.
      - Začátek věty.

      Interpunkce:
      - Čárka před spojkami (a, i, ani, nebo, či - před těmito se čárka obvykle nepíše, pokud nejsou v poměru odporovacím, vylučovacím atd.).
      - Oddělování vedlejších vět od hlavní.
      - Vsuvky, přístavky, oslovení.
    `
  },
  {
    title: 'Slovní druhy a tvary',
    description: 'Ohebné a neohebné slovní druhy, mluvnické kategorie.',
    content: `
      Ohebné slovní druhy:
      1. Podstatná jména (skloňují se)
      2. Přídavná jména (skloňují se)
      3. Zájmena (skloňují se)
      4. Číslovky (skloňují se)
      5. Slovesa (časují se)

      Neohebné slovní druhy:
      6. Příslovce
      7. Předložky
      8. Spojky
      9. Částice
      10. Citoslovce

      Mluvnické kategorie jmen:
      - Pád (1. až 7.)
      - Číslo (jednotné, množné)
      - Rod (mužský životný/neživotný, ženský, střední)
      - Vzor (pán, hrad, muž, stroj, předseda, soudce...)

      Mluvnické kategorie sloves:
      - Osoba (1., 2., 3.)
      - Číslo (jednotné, množné)
      - Způsob (oznamovací, rozkazovací, podmiňovací)
      - Čas (minulý, přítomný, budoucí)
      - Slovesný rod (činný, trpný)
      - Vid (dokonavý, nedokonavý)
    `
  },
  {
    title: 'Významy slov',
    description: 'Synonyma, antonyma, homonyma, slova mnohoznačná.',
    content: `
      Vztahy mezi slovy:
      - Synonyma: slova souznačná (stejný nebo podobný význam, např. hezký - pěkný).
      - Antonyma: slova protikladná (opačný význam, např. den - noc).
      - Homonyma: slova souzvučná (stejně znějí, ale mají jiný význam a původ, např. kolej - na vlaku / na univerzitě).
      
      Slova mnohoznačná:
      - Mají jeden základní význam a z něj odvozené další významy (např. koruna - stromu, krále, mince).

      Obohacování slovní zásoby:
      - Odvozování (předponami, příponami).
      - Skládání (spojení dvou slov, např. zeměpis).
      - Zkracování (iniciálové zkratky ČR, zkratková slova Čedok).
      - Přejímání z cizích jazyků.
    `
  }
];

const MATH_THEORY = [
  {
    title: 'Postupy řešení rovnic',
    description: 'Lineární rovnice, ekvivalentní úpravy, zkouška.',
    content: `
      Ekvivalentní úpravy:
      - Přičtení/odečtení stejného čísla k oběma stranám rovnice.
      - Vynásobení/vydělení obou stran rovnice stejným nenulovým číslem.

      Postup řešení:
      1. Odstranění závorek (roznásobení).
      2. Odstranění zlomků (vynásobení rovnice společným jmenovatelem).
      3. Převedení členů s neznámou na jednu stranu a čísel na druhou stranu.
      4. Sloučení členů.
      5. Vydělení rovnice koeficientem u neznámé.

      Zkouška:
      - Dosazení vypočítaného kořene do původního zadání rovnice (zvlášť levá a pravá strana).
    `
  },
  {
    title: 'Vzorce pro geometrii',
    description: 'Obvody, obsahy, povrchy a objemy základních útvarů.',
    content: `
      Rovinné útvary (Obvod o, Obsah S):
      - Čtverec: o = 4a, S = a²
      - Obdélník: o = 2(a+b), S = a·b
      - Trojúhelník: o = a+b+c, S = (a·v_a)/2
      - Kruh: o = 2πr, S = πr²

      Prostorové útvary (Povrch S, Objem V):
      - Krychle: S = 6a², V = a³
      - Kvádr: S = 2(ab+bc+ac), V = a·b·c
      - Válec: S = 2πr(r+v), V = πr²v
      
      Pythagorova věta:
      - c² = a² + b² (kde c je přepona, a, b jsou odvěsny pravoúhlého trojúhelníku)
    `
  },
  {
    title: 'Zlomky a procenta',
    description: 'Početní operace se zlomky, výpočet procentové části a základu.',
    content: `
      Operace se zlomky:
      - Sčítání a odčítání: Převést na společného jmenovatele, poté sečíst/odečíst čitatele.
      - Násobení: Čitatel krát čitatel, jmenovatel krát jmenovatel (předtím křížem krátit).
      - Dělení: Násobení převráceným zlomkem (druhý zlomek otočíme).
      - Rozšiřování a krácení: Násobení/dělení čitatele i jmenovatele stejným nenulovým číslem.

      Procenta:
      - 1 % = 1/100 celku (základu).
      - Základ (100 %): Částka, ze které se procenta počítají.
      - Procentová část: Konkrétní hodnota odpovídající danému počtu procent.
      - Počet procent: Udává, kolik setin základu tvoří procentová část.

      Výpočet přes 1 %:
      1. Vypočítáme 1 % (základ děleno 100).
      2. Vynásobíme počtem procent.
    `
  },
  {
    title: 'Úhly a jejich vlastnosti',
    description: 'Druhy úhlů, úhly v trojúhelníku, vedlejší a vrcholové úhly.',
    content: `
      Druhy úhlů:
      - Ostrý: 0° < α < 90°
      - Pravý: α = 90°
      - Tupý: 90° < α < 180°
      - Přímý: α = 180°
      - Plný: α = 360°

      Dvojice úhlů:
      - Vrcholové úhly: Jsou shodné (mají stejnou velikost).
      - Vedlejší úhly: Jejich součet je 180°.
      - Souhlasné a střídavé úhly: Vznikají při protnutí rovnoběžek různoběžkou, jsou shodné.

      Úhly v trojúhelníku:
      - Součet vnitřních úhlů v každém trojúhelníku je vždy 180°.
      - Vnější úhel trojúhelníku je roven součtu dvou vnitřních úhlů k němu nepřilehlých.
    `
  }
];

const TIPS = [
  "Čtěte zadání pozorně a až do konce. Často se chybuje kvůli přehlédnutí slova 'neplatí' nebo 'vyberte dvě možnosti'.",
  "U matematiky si vždy dělejte náčrtky u geometrických úloh.",
  "Neztrácejte čas u jedné těžké úlohy. Přeskočte ji a vraťte se k ní později.",
  "U češtiny si podtrhávejte klíčová slova ve výchozím textu.",
  "Zkontrolujte si, zda jste odpovědi správně přepsali do záznamového archu."
];

export function TheorySection({ onBack }: TheorySectionProps) {
  const [activeSubject, setActiveSubject] = useState<'cesky_jazyk' | 'matematika'>('cesky_jazyk');
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);

  const theoryData = activeSubject === 'cesky_jazyk' ? CZECH_THEORY : MATH_THEORY;
  const themeColor = activeSubject === 'cesky_jazyk' ? 'indigo' : 'emerald';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        <span>Zpět do hlavního menu</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Studijní materiály a tipy</h2>
        <p className="text-slate-600 mb-8">
          Zopakujte si klíčové koncepty, vzorce a pravidla, které se nejčastěji objevují u přijímacích zkoušek.
        </p>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => { setActiveSubject('cesky_jazyk'); setSelectedTopic(null); }}
            className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
              activeSubject === 'cesky_jazyk' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen size={20} />
            Český jazyk
          </button>
          <button
            onClick={() => { setActiveSubject('matematika'); setSelectedTopic(null); }}
            className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
              activeSubject === 'matematika' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Calculator size={20} />
            Matematika
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-3">
            <h3 className="font-semibold text-slate-900 mb-4 px-2 uppercase tracking-wider text-sm">Témata</h3>
            {theoryData.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTopic(topic)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedTopic?.title === topic.title
                    ? `bg-${themeColor}-50 border-${themeColor}-200 border text-${themeColor}-900 font-medium`
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {topic.title}
              </button>
            ))}
            
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-3">
                <Lightbulb size={20} className="text-amber-500" />
                Tipy ke zkoušce
              </h3>
              <ul className="space-y-3">
                {TIPS.map((tip, idx) => (
                  <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedTopic ? (
              <motion.div 
                key={selectedTopic.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-${themeColor}-100 text-${themeColor}-600 mb-6`}>
                  <FileText size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedTopic.title}</h3>
                <p className="text-slate-500 mb-8 pb-6 border-b border-slate-100">{selectedTopic.description}</p>
                
                <div className="prose prose-slate max-w-none">
                  {selectedTopic.content.split('\n\n').map((paragraph: string, idx: number) => (
                    <div key={idx} className="mb-6">
                      {paragraph.split('\n').map((line, lineIdx) => {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) return null;
                        
                        if (trimmedLine.endsWith(':')) {
                          return <h4 key={lineIdx} className="text-lg font-semibold text-slate-800 mt-4 mb-2">{trimmedLine}</h4>;
                        } else if (trimmedLine.startsWith('-')) {
                          return <li key={lineIdx} className="ml-4 text-slate-700 mb-1">{trimmedLine.substring(1).trim()}</li>;
                        } else if (/^\d+\./.test(trimmedLine)) {
                           return <li key={lineIdx} className="ml-4 text-slate-700 mb-1 list-decimal">{trimmedLine.substring(trimmedLine.indexOf('.') + 1).trim()}</li>;
                        } else {
                          return <p key={lineIdx} className="text-slate-700 mb-2">{trimmedLine}</p>;
                        }
                      })}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center min-h-[400px]">
                <BookText size={48} className="text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">Vyberte téma ze seznamu vlevo pro zobrazení detailů.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
