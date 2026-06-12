"use strict";

const TEAMS_CSV = `id,team_name,fifa_code,group_letter,is_placeholder
1,Mexico,MEX,A,False
2,South Africa,RSA,A,False
3,South Korea,KOR,A,False
4,Czech Republic,CZE,A,False
5,Canada,CAN,B,False
6,Bosnia and Herzegovina,BIH,B,False
7,Qatar,QAT,B,False
8,Switzerland,SUI,B,False
9,Brazil,BRA,C,False
10,Morocco,MAR,C,False
11,Haiti,HAI,C,False
12,Scotland,SCO,C,False
13,United States,USA,D,False
14,Paraguay,PAR,D,False
15,Australia,AUS,D,False
16,Turkey,TUR,D,False
17,Germany,GER,E,False
18,Curaçao,CUR,E,False
19,Ivory Coast,CIV,E,False
20,Ecuador,ECU,E,False
21,Netherlands,NED,F,False
22,Japan,JPN,F,False
23,Sweden,SWE,F,False
24,Tunisia,TUN,F,False
25,Belgium,BEL,G,False
26,Egypt,EGY,G,False
27,Iran,IRN,G,False
28,New Zealand,NZL,G,False
29,Spain,ESP,H,False
30,Cape Verde,CPV,H,False
31,Saudi Arabia,KSA,H,False
32,Uruguay,URU,H,False
33,France,FRA,I,False
34,Senegal,SEN,I,False
35,Iraq,IRQ,I,False
36,Norway,NOR,I,False
37,Argentina,ARG,J,False
38,Algeria,ALG,J,False
39,Austria,AUT,J,False
40,Jordan,JOR,J,False
41,Portugal,POR,K,False
42,DR Congo,COD,K,False
43,Uzbekistan,UZB,K,False
44,Colombia,COL,K,False
45,England,ENG,L,False
46,Croatia,CRO,L,False
47,Ghana,GHA,L,False
48,Panama,PAN,L,False`;

const CITIES_CSV = `id,city_name,country,venue_name,region_cluster,airport_code
1,Atlanta,USA,Mercedes-Benz Stadium,East,ATL
2,Boston,USA,Gillette Stadium,East,BOS
3,Dallas,USA,AT&T Stadium,Central,DAL
4,Houston,USA,NRG Stadium,Central,IAH
5,Kansas City,USA,Arrowhead Stadium,Central,MCI
6,Los Angeles,USA,SoFi Stadium,West,LAX
7,Miami,USA,Hard Rock Stadium,East,MIA
8,New York/New Jersey,USA,MetLife Stadium,East,EWR
9,Philadelphia,USA,Lincoln Financial Field,East,PHL
10,San Francisco Bay Area,USA,Levi's Stadium,West,SFO
11,Seattle,USA,Lumen Field,West,SEA
12,Toronto,Canada,BMO Field,East,YYZ
13,Vancouver,Canada,BC Place,West,YVR
14,Guadalajara,Mexico,Estadio Akron,Central,GDL
15,Mexico City,Mexico,Estadio Azteca,Central,MEX
16,Monterrey,Mexico,Estadio BBVA,Central,MTY`;

const STAGES_CSV = `id,stage_name,stage_order
1,Group Stage,1
2,Round of 32,2
3,Round of 16,3
4,Quarterfinals,4
5,Semifinals,5
6,Third Place Playoff,6
7,Final,7`;

const MATCHES_CSV = `id,match_number,home_team_id,away_team_id,city_id,stage_id,kickoff_at,match_label
1,1,1,2,15,1,2026-06-11 13:00:00-06,Group A
2,2,3,4,14,1,2026-06-11 20:00:00-06,Group A
3,3,5,6,12,1,2026-06-12 15:00:00-04,Group B
4,4,13,14,6,1,2026-06-12 18:00:00-07,Group D
5,5,11,12,2,1,2026-06-13 21:00:00-04,Group C
6,6,15,16,13,1,2026-06-13 21:00:00-07,Group D
7,7,9,10,8,1,2026-06-13 18:00:00-04,Group C
8,8,7,8,10,1,2026-06-13 12:00:00-07,Group B
9,9,19,20,9,1,2026-06-14 19:00:00-04,Group E
10,10,17,18,4,1,2026-06-14 12:00:00-05,Group E
11,11,21,22,3,1,2026-06-14 15:00:00-05,Group F
12,12,23,24,16,1,2026-06-14 20:00:00-06,Group F
13,13,31,32,7,1,2026-06-15 18:00:00-04,Group H
14,14,29,30,1,1,2026-06-15 12:00:00-04,Group H
15,15,27,28,6,1,2026-06-15 18:00:00-07,Group G
16,16,25,26,11,1,2026-06-15 12:00:00-07,Group G
17,17,33,34,8,1,2026-06-16 15:00:00-04,Group I
18,18,35,36,2,1,2026-06-16 18:00:00-04,Group I
19,19,37,38,5,1,2026-06-16 20:00:00-05,Group J
20,20,39,40,10,1,2026-06-16 21:00:00-07,Group J
21,21,47,48,12,1,2026-06-17 19:00:00-04,Group L
22,22,45,46,3,1,2026-06-17 15:00:00-05,Group L
23,23,41,42,4,1,2026-06-17 12:00:00-05,Group K
24,24,43,44,15,1,2026-06-17 20:00:00-06,Group K
25,25,4,2,1,1,2026-06-18 12:00:00-04,Group A
26,26,8,6,6,1,2026-06-18 12:00:00-07,Group B
27,27,5,7,13,1,2026-06-18 15:00:00-07,Group B
28,28,1,3,14,1,2026-06-18 19:00:00-06,Group A
29,29,9,11,9,1,2026-06-19 20:30:00-04,Group C
30,30,12,10,2,1,2026-06-19 18:00:00-04,Group C
31,31,16,14,10,1,2026-06-19 20:00:00-07,Group D
32,32,13,15,11,1,2026-06-19 12:00:00-07,Group D
33,33,17,19,12,1,2026-06-20 16:00:00-04,Group E
34,34,20,18,5,1,2026-06-20 19:00:00-05,Group E
35,35,21,23,4,1,2026-06-20 12:00:00-05,Group F
36,36,24,22,16,1,2026-06-20 22:00:00-06,Group F
37,37,32,30,7,1,2026-06-21 18:00:00-04,Group H
38,38,29,31,1,1,2026-06-21 12:00:00-04,Group H
39,39,25,27,6,1,2026-06-21 12:00:00-07,Group G
40,40,28,26,13,1,2026-06-21 18:00:00-07,Group G
41,41,36,34,8,1,2026-06-22 20:00:00-04,Group I
42,42,33,35,9,1,2026-06-22 17:00:00-04,Group I
43,43,37,39,3,1,2026-06-22 12:00:00-05,Group J
44,44,40,38,10,1,2026-06-22 20:00:00-07,Group J
45,45,45,47,2,1,2026-06-23 16:00:00-04,Group L
46,46,48,46,12,1,2026-06-23 19:00:00-04,Group L
47,47,41,43,4,1,2026-06-23 12:00:00-05,Group K
48,48,44,42,14,1,2026-06-23 20:00:00-06,Group K
49,49,12,9,7,1,2026-06-24 18:00:00-04,Group C
50,50,10,11,1,1,2026-06-24 18:00:00-04,Group C
51,51,8,5,13,1,2026-06-24 12:00:00-07,Group B
52,52,6,7,11,1,2026-06-24 12:00:00-07,Group B
53,53,4,1,15,1,2026-06-24 19:00:00-06,Group A
54,54,2,3,16,1,2026-06-24 19:00:00-06,Group A
55,55,18,19,9,1,2026-06-25 16:00:00-04,Group E
56,56,20,17,8,1,2026-06-25 16:00:00-04,Group E
57,57,22,23,3,1,2026-06-25 18:00:00-05,Group F
58,58,24,21,5,1,2026-06-25 18:00:00-05,Group F
59,59,16,13,6,1,2026-06-25 19:00:00-07,Group D
60,60,14,15,10,1,2026-06-25 19:00:00-07,Group D
61,61,36,33,2,1,2026-06-26 15:00:00-04,Group I
62,62,34,35,12,1,2026-06-26 15:00:00-04,Group I
63,63,26,27,11,1,2026-06-26 20:00:00-07,Group G
64,64,28,25,13,1,2026-06-26 20:00:00-07,Group G
65,65,30,31,4,1,2026-06-26 19:00:00-05,Group H
66,66,32,29,14,1,2026-06-26 18:00:00-06,Group H
67,67,48,45,8,1,2026-06-27 17:00:00-04,Group L
68,68,46,47,9,1,2026-06-27 17:00:00-04,Group L
69,69,38,39,5,1,2026-06-27 21:00:00-05,Group J
70,70,40,37,3,1,2026-06-27 21:00:00-05,Group J
71,71,44,41,7,1,2026-06-27 19:30:00-04,Group K
72,72,42,43,1,1,2026-06-27 19:30:00-04,Group K
73,73,,,6,2,2026-06-28 12:00:00-07,Runner-up Group A vs Runner-up Group B
74,74,,,2,2,2026-06-29 16:30:00-04,Winner Group E vs 3rd Group A/B/C/D/F
75,75,,,16,2,2026-06-29 19:00:00-06,Winner Group F vs Runner-up Group C
76,76,,,4,2,2026-06-29 12:00:00-05,Winner Group C vs Runner-up Group F
77,77,,,8,2,2026-06-30 17:00:00-04,Winner Group I vs 3rd Group C/D/F/G/H
78,78,,,3,2,2026-06-30 12:00:00-05,Runner-up Group E vs Runner-up Group I
79,79,,,15,2,2026-06-30 19:00:00-06,Winner Group A vs 3rd Group C/E/F/H/I
80,80,,,1,2,2026-07-01 12:00:00-04,Winner Group L vs 3rd Group E/H/I/J/K
81,81,,,10,2,2026-07-01 17:00:00-07,Winner Group D vs 3rd Group B/E/F/I/J
82,82,,,11,2,2026-07-01 13:00:00-07,Winner Group G vs 3rd Group A/E/H/I/J
83,83,,,12,2,2026-07-02 19:00:00-04,Runner-up Group K vs Runner-up Group L
84,84,,,6,2,2026-07-02 12:00:00-07,Winner Group H vs Runner-up Group J
85,85,,,13,2,2026-07-02 20:00:00-07,Winner Group B vs 3rd Group E/F/G/I/J
86,86,,,7,2,2026-07-03 18:00:00-04,Winner Group J vs Runner-up Group H
87,87,,,5,2,2026-07-03 20:30:00-05,Winner Group K vs 3rd Group D/E/I/J/L
88,88,,,3,2,2026-07-03 13:00:00-05,Runner-up Group D vs Runner-up Group G
89,89,,,9,3,2026-07-04 17:00:00-04,Winner Match 74 vs Winner Match 77
90,90,,,4,3,2026-07-04 12:00:00-05,Winner Match 73 vs Winner Match 75
91,91,,,8,3,2026-07-05 16:00:00-04,Winner Match 76 vs Winner Match 78
92,92,,,15,3,2026-07-05 18:00:00-06,Winner Match 79 vs Winner Match 80
93,93,,,3,3,2026-07-06 14:00:00-05,Winner Match 83 vs Winner Match 84
94,94,,,11,3,2026-07-06 17:00:00-07,Winner Match 81 vs Winner Match 82
95,95,,,1,3,2026-07-07 12:00:00-04,Winner Match 86 vs Winner Match 88
96,96,,,13,3,2026-07-07 13:00:00-07,Winner Match 85 vs Winner Match 87
97,97,,,2,4,2026-07-09 16:00:00-04,Winner Match 89 vs Winner Match 90
98,98,,,6,4,2026-07-10 12:00:00-07,Winner Match 93 vs Winner Match 94
99,99,,,7,4,2026-07-11 17:00:00-04,Winner Match 91 vs Winner Match 92
100,100,,,5,4,2026-07-11 20:00:00-05,Winner Match 95 vs Winner Match 96
101,101,,,3,5,2026-07-14 14:00:00-05,Winner Match 97 vs Winner Match 98
102,102,,,1,5,2026-07-15 15:00:00-04,Winner Match 99 vs Winner Match 100
103,103,,,7,6,2026-07-18 17:00:00-04,Loser Match 101 vs Loser Match 102
104,104,,,8,7,2026-07-19 15:00:00-04,Winner Match 101 vs Winner Match 102`;

const THIRD_PLACE_COMBINATIONS = `EFGHIJKL:3E,3J,3I,3F,3H,3G,3L,3K\nDFGHIJKL:3H,3G,3I,3D,3J,3F,3L,3K\nDEGHIJKL:3E,3J,3I,3D,3H,3G,3L,3K\nDEFHIJKL:3E,3J,3I,3D,3H,3F,3L,3K\nDEFGIJKL:3E,3G,3I,3D,3J,3F,3L,3K\nDEFGHJKL:3E,3G,3J,3D,3H,3F,3L,3K\nDEFGHIKL:3E,3G,3I,3D,3H,3F,3L,3K\nDEFGHIJL:3E,3G,3J,3D,3H,3F,3L,3I\nDEFGHIJK:3E,3G,3J,3D,3H,3F,3I,3K\nCFGHIJKL:3H,3G,3I,3C,3J,3F,3L,3K\nCEGHIJKL:3E,3J,3I,3C,3H,3G,3L,3K\nCEFHIJKL:3E,3J,3I,3C,3H,3F,3L,3K\nCEFGIJKL:3E,3G,3I,3C,3J,3F,3L,3K\nCEFGHJKL:3E,3G,3J,3C,3H,3F,3L,3K\nCEFGHIKL:3E,3G,3I,3C,3H,3F,3L,3K\nCEFGHIJL:3E,3G,3J,3C,3H,3F,3L,3I\nCEFGHIJK:3E,3G,3J,3C,3H,3F,3I,3K\nCDGHIJKL:3H,3G,3I,3C,3J,3D,3L,3K\nCDFHIJKL:3C,3J,3I,3D,3H,3F,3L,3K\nCDFGIJKL:3C,3G,3I,3D,3J,3F,3L,3K\nCDFGHJKL:3C,3G,3J,3D,3H,3F,3L,3K\nCDFGHIKL:3C,3G,3I,3D,3H,3F,3L,3K\nCDFGHIJL:3C,3G,3J,3D,3H,3F,3L,3I\nCDFGHIJK:3C,3G,3J,3D,3H,3F,3I,3K\nCDEHIJKL:3E,3J,3I,3C,3H,3D,3L,3K\nCDEGIJKL:3E,3G,3I,3C,3J,3D,3L,3K\nCDEGHJKL:3E,3G,3J,3C,3H,3D,3L,3K\nCDEGHIKL:3E,3G,3I,3C,3H,3D,3L,3K\nCDEGHIJL:3E,3G,3J,3C,3H,3D,3L,3I\nCDEGHIJK:3E,3G,3J,3C,3H,3D,3I,3K\nCDEFIJKL:3C,3J,3E,3D,3I,3F,3L,3K\nCDEFHJKL:3C,3J,3E,3D,3H,3F,3L,3K\nCDEFHIKL:3C,3E,3I,3D,3H,3F,3L,3K\nCDEFHIJL:3C,3J,3E,3D,3H,3F,3L,3I\nCDEFHIJK:3C,3J,3E,3D,3H,3F,3I,3K\nCDEFGJKL:3C,3G,3E,3D,3J,3F,3L,3K\nCDEFGIKL:3C,3G,3E,3D,3I,3F,3L,3K\nCDEFGIJL:3C,3G,3E,3D,3J,3F,3L,3I\nCDEFGIJK:3C,3G,3E,3D,3J,3F,3I,3K\nCDEFGHKL:3C,3G,3E,3D,3H,3F,3L,3K\nCDEFGHJL:3C,3G,3J,3D,3H,3F,3L,3E\nCDEFGHJK:3C,3G,3J,3D,3H,3F,3E,3K\nCDEFGHIL:3C,3G,3E,3D,3H,3F,3L,3I\nCDEFGHIK:3C,3G,3E,3D,3H,3F,3I,3K\nCDEFGHIJ:3C,3G,3J,3D,3H,3F,3E,3I\nBFGHIJKL:3H,3J,3B,3F,3I,3G,3L,3K\nBEGHIJKL:3E,3J,3I,3B,3H,3G,3L,3K\nBEFHIJKL:3E,3J,3B,3F,3I,3H,3L,3K\nBEFGIJKL:3E,3J,3B,3F,3I,3G,3L,3K\nBEFGHJKL:3E,3J,3B,3F,3H,3G,3L,3K\nBEFGHIKL:3E,3G,3B,3F,3I,3H,3L,3K\nBEFGHIJL:3E,3J,3B,3F,3H,3G,3L,3I\nBEFGHIJK:3E,3J,3B,3F,3H,3G,3I,3K\nBDGHIJKL:3H,3J,3B,3D,3I,3G,3L,3K\nBDFHIJKL:3H,3J,3B,3D,3I,3F,3L,3K\nBDFGIJKL:3I,3G,3B,3D,3J,3F,3L,3K\nBDFGHJKL:3H,3G,3B,3D,3J,3F,3L,3K\nBDFGHIKL:3H,3G,3B,3D,3I,3F,3L,3K\nBDFGHIJL:3H,3G,3B,3D,3J,3F,3L,3I\nBDFGHIJK:3H,3G,3B,3D,3J,3F,3I,3K\nBDEHIJKL:3E,3J,3B,3D,3I,3H,3L,3K\nBDEGIJKL:3E,3J,3B,3D,3I,3G,3L,3K\nBDEGHJKL:3E,3J,3B,3D,3H,3G,3L,3K\nBDEGHIKL:3E,3G,3B,3D,3I,3H,3L,3K\nBDEGHIJL:3E,3J,3B,3D,3H,3G,3L,3I\nBDEGHIJK:3E,3J,3B,3D,3H,3G,3I,3K\nBDEFIJKL:3E,3J,3B,3D,3I,3F,3L,3K\nBDEFHJKL:3E,3J,3B,3D,3H,3F,3L,3K\nBDEFHIKL:3E,3I,3B,3D,3H,3F,3L,3K\nBDEFHIJL:3E,3J,3B,3D,3H,3F,3L,3I\nBDEFHIJK:3E,3J,3B,3D,3H,3F,3I,3K\nBDEFGJKL:3E,3G,3B,3D,3J,3F,3L,3K\nBDEFGIKL:3E,3G,3B,3D,3I,3F,3L,3K\nBDEFGIJL:3E,3G,3B,3D,3J,3F,3L,3I\nBDEFGIJK:3E,3G,3B,3D,3J,3F,3I,3K\nBDEFGHKL:3E,3G,3B,3D,3H,3F,3L,3K\nBDEFGHJL:3H,3G,3B,3D,3J,3F,3L,3E\nBDEFGHJK:3H,3G,3B,3D,3J,3F,3E,3K\nBDEFGHIL:3E,3G,3B,3D,3H,3F,3L,3I\nBDEFGHIK:3E,3G,3B,3D,3H,3F,3I,3K\nBDEFGHIJ:3H,3G,3B,3D,3J,3F,3E,3I\nBCGHIJKL:3H,3J,3B,3C,3I,3G,3L,3K\nBCFHIJKL:3H,3J,3B,3C,3I,3F,3L,3K\nBCFGIJKL:3I,3G,3B,3C,3J,3F,3L,3K\nBCFGHJKL:3H,3G,3B,3C,3J,3F,3L,3K\nBCFGHIKL:3H,3G,3B,3C,3I,3F,3L,3K\nBCFGHIJL:3H,3G,3B,3C,3J,3F,3L,3I\nBCFGHIJK:3H,3G,3B,3C,3J,3F,3I,3K\nBCEHIJKL:3E,3J,3B,3C,3I,3H,3L,3K\nBCEGIJKL:3E,3J,3B,3C,3I,3G,3L,3K\nBCEGHJKL:3E,3J,3B,3C,3H,3G,3L,3K\nBCEGHIKL:3E,3G,3B,3C,3I,3H,3L,3K\nBCEGHIJL:3E,3J,3B,3C,3H,3G,3L,3I\nBCEGHIJK:3E,3J,3B,3C,3H,3G,3I,3K\nBCEFIJKL:3E,3J,3B,3C,3I,3F,3L,3K\nBCEFHJKL:3E,3J,3B,3C,3H,3F,3L,3K\nBCEFHIKL:3E,3I,3B,3C,3H,3F,3L,3K\nBCEFHIJL:3E,3J,3B,3C,3H,3F,3L,3I\nBCEFHIJK:3E,3J,3B,3C,3H,3F,3I,3K\nBCEFGJKL:3E,3G,3B,3C,3J,3F,3L,3K\nBCEFGIKL:3E,3G,3B,3C,3I,3F,3L,3K\nBCEFGIJL:3E,3G,3B,3C,3J,3F,3L,3I\nBCEFGIJK:3E,3G,3B,3C,3J,3F,3I,3K\nBCEFGHKL:3E,3G,3B,3C,3H,3F,3L,3K\nBCEFGHJL:3H,3G,3B,3C,3J,3F,3L,3E\nBCEFGHJK:3H,3G,3B,3C,3J,3F,3E,3K\nBCEFGHIL:3E,3G,3B,3C,3H,3F,3L,3I\nBCEFGHIK:3E,3G,3B,3C,3H,3F,3I,3K\nBCEFGHIJ:3H,3G,3B,3C,3J,3F,3E,3I\nBCDHIJKL:3H,3J,3B,3C,3I,3D,3L,3K\nBCDGIJKL:3I,3G,3B,3C,3J,3D,3L,3K\nBCDGHJKL:3H,3G,3B,3C,3J,3D,3L,3K\nBCDGHIKL:3H,3G,3B,3C,3I,3D,3L,3K\nBCDGHIJL:3H,3G,3B,3C,3J,3D,3L,3I\nBCDGHIJK:3H,3G,3B,3C,3J,3D,3I,3K\nBCDFIJKL:3C,3J,3B,3D,3I,3F,3L,3K\nBCDFHJKL:3C,3J,3B,3D,3H,3F,3L,3K\nBCDFHIKL:3C,3I,3B,3D,3H,3F,3L,3K\nBCDFHIJL:3C,3J,3B,3D,3H,3F,3L,3I\nBCDFHIJK:3C,3J,3B,3D,3H,3F,3I,3K\nBCDFGJKL:3C,3G,3B,3D,3J,3F,3L,3K\nBCDFGIKL:3C,3G,3B,3D,3I,3F,3L,3K\nBCDFGIJL:3C,3G,3B,3D,3J,3F,3L,3I\nBCDFGIJK:3C,3G,3B,3D,3J,3F,3I,3K\nBCDFGHKL:3C,3G,3B,3D,3H,3F,3L,3K\nBCDFGHJL:3C,3G,3B,3D,3H,3F,3L,3J\nBCDFGHJK:3H,3G,3B,3C,3J,3F,3D,3K\nBCDFGHIL:3C,3G,3B,3D,3H,3F,3L,3I\nBCDFGHIK:3C,3G,3B,3D,3H,3F,3I,3K\nBCDFGHIJ:3H,3G,3B,3C,3J,3F,3D,3I\nBCDEIJKL:3E,3J,3B,3C,3I,3D,3L,3K\nBCDEHJKL:3E,3J,3B,3C,3H,3D,3L,3K\nBCDEHIKL:3E,3I,3B,3C,3H,3D,3L,3K\nBCDEHIJL:3E,3J,3B,3C,3H,3D,3L,3I\nBCDEHIJK:3E,3J,3B,3C,3H,3D,3I,3K\nBCDEGJKL:3E,3G,3B,3C,3J,3D,3L,3K\nBCDEGIKL:3E,3G,3B,3C,3I,3D,3L,3K\nBCDEGIJL:3E,3G,3B,3C,3J,3D,3L,3I\nBCDEGIJK:3E,3G,3B,3C,3J,3D,3I,3K\nBCDEGHKL:3E,3G,3B,3C,3H,3D,3L,3K\nBCDEGHJL:3H,3G,3B,3C,3J,3D,3L,3E\nBCDEGHJK:3H,3G,3B,3C,3J,3D,3E,3K\nBCDEGHIL:3E,3G,3B,3C,3H,3D,3L,3I\nBCDEGHIK:3E,3G,3B,3C,3H,3D,3I,3K\nBCDEGHIJ:3H,3G,3B,3C,3J,3D,3E,3I\nBCDEFJKL:3C,3J,3B,3D,3E,3F,3L,3K\nBCDEFIKL:3C,3E,3B,3D,3I,3F,3L,3K\nBCDEFIJL:3C,3J,3B,3D,3E,3F,3L,3I\nBCDEFIJK:3C,3J,3B,3D,3E,3F,3I,3K\nBCDEFHKL:3C,3E,3B,3D,3H,3F,3L,3K\nBCDEFHJL:3C,3J,3B,3D,3H,3F,3L,3E\nBCDEFHJK:3C,3J,3B,3D,3H,3F,3E,3K\nBCDEFHIL:3C,3E,3B,3D,3H,3F,3L,3I\nBCDEFHIK:3C,3E,3B,3D,3H,3F,3I,3K\nBCDEFHIJ:3C,3J,3B,3D,3H,3F,3E,3I\nBCDEFGKL:3C,3G,3B,3D,3E,3F,3L,3K\nBCDEFGJL:3C,3G,3B,3D,3J,3F,3L,3E\nBCDEFGJK:3C,3G,3B,3D,3J,3F,3E,3K\nBCDEFGIL:3C,3G,3B,3D,3E,3F,3L,3I\nBCDEFGIK:3C,3G,3B,3D,3E,3F,3I,3K\nBCDEFGIJ:3C,3G,3B,3D,3J,3F,3E,3I\nBCDEFGHL:3C,3G,3B,3D,3H,3F,3L,3E\nBCDEFGHK:3C,3G,3B,3D,3H,3F,3E,3K\nBCDEFGHJ:3H,3G,3B,3C,3J,3F,3D,3E\nBCDEFGHI:3C,3G,3B,3D,3H,3F,3E,3I\nAFGHIJKL:3H,3J,3I,3F,3A,3G,3L,3K\nAEGHIJKL:3E,3J,3I,3A,3H,3G,3L,3K\nAEFHIJKL:3E,3J,3I,3F,3A,3H,3L,3K\nAEFGIJKL:3E,3J,3I,3F,3A,3G,3L,3K\nAEFGHJKL:3E,3G,3J,3F,3A,3H,3L,3K\nAEFGHIKL:3E,3G,3I,3F,3A,3H,3L,3K\nAEFGHIJL:3E,3G,3J,3F,3A,3H,3L,3I\nAEFGHIJK:3E,3G,3J,3F,3A,3H,3I,3K\nADGHIJKL:3H,3J,3I,3D,3A,3G,3L,3K\nADFHIJKL:3H,3J,3I,3D,3A,3F,3L,3K\nADFGIJKL:3I,3G,3J,3D,3A,3F,3L,3K\nADFGHJKL:3H,3G,3J,3D,3A,3F,3L,3K\nADFGHIKL:3H,3G,3I,3D,3A,3F,3L,3K\nADFGHIJL:3H,3G,3J,3D,3A,3F,3L,3I\nADFGHIJK:3H,3G,3J,3D,3A,3F,3I,3K\nADEHIJKL:3E,3J,3I,3D,3A,3H,3L,3K\nADEGIJKL:3E,3J,3I,3D,3A,3G,3L,3K\nADEGHJKL:3E,3G,3J,3D,3A,3H,3L,3K\nADEGHIKL:3E,3G,3I,3D,3A,3H,3L,3K\nADEGHIJL:3E,3G,3J,3D,3A,3H,3L,3I\nADEGHIJK:3E,3G,3J,3D,3A,3H,3I,3K\nADEFIJKL:3E,3J,3I,3D,3A,3F,3L,3K\nADEFHJKL:3H,3J,3E,3D,3A,3F,3L,3K\nADEFHIKL:3H,3E,3I,3D,3A,3F,3L,3K\nADEFHIJL:3H,3J,3E,3D,3A,3F,3L,3I\nADEFHIJK:3H,3J,3E,3D,3A,3F,3I,3K\nADEFGJKL:3E,3G,3J,3D,3A,3F,3L,3K\nADEFGIKL:3E,3G,3I,3D,3A,3F,3L,3K\nADEFGIJL:3E,3G,3J,3D,3A,3F,3L,3I\nADEFGIJK:3E,3G,3J,3D,3A,3F,3I,3K\nADEFGHKL:3H,3G,3E,3D,3A,3F,3L,3K\nADEFGHJL:3H,3G,3J,3D,3A,3F,3L,3E\nADEFGHJK:3H,3G,3J,3D,3A,3F,3E,3K\nADEFGHIL:3H,3G,3E,3D,3A,3F,3L,3I\nADEFGHIK:3H,3G,3E,3D,3A,3F,3I,3K\nADEFGHIJ:3H,3G,3J,3D,3A,3F,3E,3I\nACGHIJKL:3H,3J,3I,3C,3A,3G,3L,3K\nACFHIJKL:3H,3J,3I,3C,3A,3F,3L,3K\nACFGIJKL:3I,3G,3J,3C,3A,3F,3L,3K\nACFGHJKL:3H,3G,3J,3C,3A,3F,3L,3K\nACFGHIKL:3H,3G,3I,3C,3A,3F,3L,3K\nACFGHIJL:3H,3G,3J,3C,3A,3F,3L,3I\nACFGHIJK:3H,3G,3J,3C,3A,3F,3I,3K\nACEHIJKL:3E,3J,3I,3C,3A,3H,3L,3K\nACEGIJKL:3E,3J,3I,3C,3A,3G,3L,3K\nACEGHJKL:3E,3G,3J,3C,3A,3H,3L,3K\nACEGHIKL:3E,3G,3I,3C,3A,3H,3L,3K\nACEGHIJL:3E,3G,3J,3C,3A,3H,3L,3I\nACEGHIJK:3E,3G,3J,3C,3A,3H,3I,3K\nACEFIJKL:3E,3J,3I,3C,3A,3F,3L,3K\nACEFHJKL:3H,3J,3E,3C,3A,3F,3L,3K\nACEFHIKL:3H,3E,3I,3C,3A,3F,3L,3K\nACEFHIJL:3H,3J,3E,3C,3A,3F,3L,3I\nACEFHIJK:3H,3J,3E,3C,3A,3F,3I,3K\nACEFGJKL:3E,3G,3J,3C,3A,3F,3L,3K\nACEFGIKL:3E,3G,3I,3C,3A,3F,3L,3K\nACEFGIJL:3E,3G,3J,3C,3A,3F,3L,3I\nACEFGIJK:3E,3G,3J,3C,3A,3F,3I,3K\nACEFGHKL:3H,3G,3E,3C,3A,3F,3L,3K\nACEFGHJL:3H,3G,3J,3C,3A,3F,3L,3E\nACEFGHJK:3H,3G,3J,3C,3A,3F,3E,3K\nACEFGHIL:3H,3G,3E,3C,3A,3F,3L,3I\nACEFGHIK:3H,3G,3E,3C,3A,3F,3I,3K\nACEFGHIJ:3H,3G,3J,3C,3A,3F,3E,3I\nACDHIJKL:3H,3J,3I,3C,3A,3D,3L,3K\nACDGIJKL:3I,3G,3J,3C,3A,3D,3L,3K\nACDGHJKL:3H,3G,3J,3C,3A,3D,3L,3K\nACDGHIKL:3H,3G,3I,3C,3A,3D,3L,3K\nACDGHIJL:3H,3G,3J,3C,3A,3D,3L,3I\nACDGHIJK:3H,3G,3J,3C,3A,3D,3I,3K\nACDFIJKL:3C,3J,3I,3D,3A,3F,3L,3K\nACDFHJKL:3H,3J,3F,3C,3A,3D,3L,3K\nACDFHIKL:3H,3F,3I,3C,3A,3D,3L,3K\nACDFHIJL:3H,3J,3F,3C,3A,3D,3L,3I\nACDFHIJK:3H,3J,3F,3C,3A,3D,3I,3K\nACDFGJKL:3C,3G,3J,3D,3A,3F,3L,3K\nACDFGIKL:3C,3G,3I,3D,3A,3F,3L,3K\nACDFGIJL:3C,3G,3J,3D,3A,3F,3L,3I\nACDFGIJK:3C,3G,3J,3D,3A,3F,3I,3K\nACDFGHKL:3H,3G,3F,3C,3A,3D,3L,3K\nACDFGHJL:3C,3G,3J,3D,3A,3F,3L,3H\nACDFGHJK:3H,3G,3J,3C,3A,3F,3D,3K\nACDFGHIL:3H,3G,3F,3C,3A,3D,3L,3I\nACDFGHIK:3H,3G,3F,3C,3A,3D,3I,3K\nACDFGHIJ:3H,3G,3J,3C,3A,3F,3D,3I\nACDEIJKL:3E,3J,3I,3C,3A,3D,3L,3K\nACDEHJKL:3H,3J,3E,3C,3A,3D,3L,3K\nACDEHIKL:3H,3E,3I,3C,3A,3D,3L,3K\nACDEHIJL:3H,3J,3E,3C,3A,3D,3L,3I\nACDEHIJK:3H,3J,3E,3C,3A,3D,3I,3K\nACDEGJKL:3E,3G,3J,3C,3A,3D,3L,3K\nACDEGIKL:3E,3G,3I,3C,3A,3D,3L,3K\nACDEGIJL:3E,3G,3J,3C,3A,3D,3L,3I\nACDEGIJK:3E,3G,3J,3C,3A,3D,3I,3K\nACDEGHKL:3H,3G,3E,3C,3A,3D,3L,3K\nACDEGHJL:3H,3G,3J,3C,3A,3D,3L,3E\nACDEGHJK:3H,3G,3J,3C,3A,3D,3E,3K\nACDEGHIL:3H,3G,3E,3C,3A,3D,3L,3I\nACDEGHIK:3H,3G,3E,3C,3A,3D,3I,3K\nACDEGHIJ:3H,3G,3J,3C,3A,3D,3E,3I\nACDEFJKL:3C,3J,3E,3D,3A,3F,3L,3K\nACDEFIKL:3C,3E,3I,3D,3A,3F,3L,3K\nACDEFIJL:3C,3J,3E,3D,3A,3F,3L,3I\nACDEFIJK:3C,3J,3E,3D,3A,3F,3I,3K\nACDEFHKL:3H,3E,3F,3C,3A,3D,3L,3K\nACDEFHJL:3H,3J,3F,3C,3A,3D,3L,3E\nACDEFHJK:3H,3J,3E,3C,3A,3F,3D,3K\nACDEFHIL:3H,3E,3F,3C,3A,3D,3L,3I\nACDEFHIK:3H,3E,3F,3C,3A,3D,3I,3K\nACDEFHIJ:3H,3J,3E,3C,3A,3F,3D,3I\nACDEFGKL:3C,3G,3E,3D,3A,3F,3L,3K\nACDEFGJL:3C,3G,3J,3D,3A,3F,3L,3E\nACDEFGJK:3C,3G,3J,3D,3A,3F,3E,3K\nACDEFGIL:3C,3G,3E,3D,3A,3F,3L,3I\nACDEFGIK:3C,3G,3E,3D,3A,3F,3I,3K\nACDEFGIJ:3C,3G,3J,3D,3A,3F,3E,3I\nACDEFGHL:3H,3G,3F,3C,3A,3D,3L,3E\nACDEFGHK:3H,3G,3E,3C,3A,3F,3D,3K\nACDEFGHJ:3H,3G,3J,3C,3A,3F,3D,3E\nACDEFGHI:3H,3G,3E,3C,3A,3F,3D,3I\nABGHIJKL:3H,3J,3B,3A,3I,3G,3L,3K\nABFHIJKL:3H,3J,3B,3A,3I,3F,3L,3K\nABFGIJKL:3I,3J,3B,3F,3A,3G,3L,3K\nABFGHJKL:3H,3J,3B,3F,3A,3G,3L,3K\nABFGHIKL:3H,3G,3B,3A,3I,3F,3L,3K\nABFGHIJL:3H,3J,3B,3F,3A,3G,3L,3I\nABFGHIJK:3H,3J,3B,3F,3A,3G,3I,3K\nABEHIJKL:3E,3J,3B,3A,3I,3H,3L,3K\nABEGIJKL:3E,3J,3B,3A,3I,3G,3L,3K\nABEGHJKL:3E,3J,3B,3A,3H,3G,3L,3K\nABEGHIKL:3E,3G,3B,3A,3I,3H,3L,3K\nABEGHIJL:3E,3J,3B,3A,3H,3G,3L,3I\nABEGHIJK:3E,3J,3B,3A,3H,3G,3I,3K\nABEFIJKL:3E,3J,3B,3A,3I,3F,3L,3K\nABEFHJKL:3E,3J,3B,3F,3A,3H,3L,3K\nABEFHIKL:3E,3I,3B,3F,3A,3H,3L,3K\nABEFHIJL:3E,3J,3B,3F,3A,3H,3L,3I\nABEFHIJK:3E,3J,3B,3F,3A,3H,3I,3K\nABEFGJKL:3E,3J,3B,3F,3A,3G,3L,3K\nABEFGIKL:3E,3G,3B,3A,3I,3F,3L,3K\nABEFGIJL:3E,3J,3B,3F,3A,3G,3L,3I\nABEFGIJK:3E,3J,3B,3F,3A,3G,3I,3K\nABEFGHKL:3E,3G,3B,3F,3A,3H,3L,3K\nABEFGHJL:3H,3J,3B,3F,3A,3G,3L,3E\nABEFGHJK:3H,3J,3B,3F,3A,3G,3E,3K\nABEFGHIL:3E,3G,3B,3F,3A,3H,3L,3I\nABEFGHIK:3E,3G,3B,3F,3A,3H,3I,3K\nABEFGHIJ:3H,3J,3B,3F,3A,3G,3E,3I\nABDHIJKL:3I,3J,3B,3D,3A,3H,3L,3K\nABDGIJKL:3I,3J,3B,3D,3A,3G,3L,3K\nABDGHJKL:3H,3J,3B,3D,3A,3G,3L,3K\nABDGHIKL:3I,3G,3B,3D,3A,3H,3L,3K\nABDGHIJL:3H,3J,3B,3D,3A,3G,3L,3I\nABDGHIJK:3H,3J,3B,3D,3A,3G,3I,3K\nABDFIJKL:3I,3J,3B,3D,3A,3F,3L,3K\nABDFHJKL:3H,3J,3B,3D,3A,3F,3L,3K\nABDFHIKL:3H,3I,3B,3D,3A,3F,3L,3K\nABDFHIJL:3H,3J,3B,3D,3A,3F,3L,3I\nABDFHIJK:3H,3J,3B,3D,3A,3F,3I,3K\nABDFGJKL:3F,3J,3B,3D,3A,3G,3L,3K\nABDFGIKL:3I,3G,3B,3D,3A,3F,3L,3K\nABDFGIJL:3F,3J,3B,3D,3A,3G,3L,3I\nABDFGIJK:3F,3J,3B,3D,3A,3G,3I,3K\nABDFGHKL:3H,3G,3B,3D,3A,3F,3L,3K\nABDFGHJL:3H,3G,3B,3D,3A,3F,3L,3J\nABDFGHJK:3H,3G,3B,3D,3A,3F,3J,3K\nABDFGHIL:3H,3G,3B,3D,3A,3F,3L,3I\nABDFGHIK:3H,3G,3B,3D,3A,3F,3I,3K\nABDFGHIJ:3H,3G,3B,3D,3A,3F,3I,3J\nABDEIJKL:3E,3J,3B,3A,3I,3D,3L,3K\nABDEHJKL:3E,3J,3B,3D,3A,3H,3L,3K\nABDEHIKL:3E,3I,3B,3D,3A,3H,3L,3K\nABDEHIJL:3E,3J,3B,3D,3A,3H,3L,3I\nABDEHIJK:3E,3J,3B,3D,3A,3H,3I,3K\nABDEGJKL:3E,3J,3B,3D,3A,3G,3L,3K\nABDEGIKL:3E,3G,3B,3A,3I,3D,3L,3K\nABDEGIJL:3E,3J,3B,3D,3A,3G,3L,3I\nABDEGIJK:3E,3J,3B,3D,3A,3G,3I,3K\nABDEGHKL:3E,3G,3B,3D,3A,3H,3L,3K\nABDEGHJL:3H,3J,3B,3D,3A,3G,3L,3E\nABDEGHJK:3H,3J,3B,3D,3A,3G,3E,3K\nABDEGHIL:3E,3G,3B,3D,3A,3H,3L,3I\nABDEGHIK:3E,3G,3B,3D,3A,3H,3I,3K\nABDEGHIJ:3H,3J,3B,3D,3A,3G,3E,3I\nABDEFJKL:3E,3J,3B,3D,3A,3F,3L,3K\nABDEFIKL:3E,3I,3B,3D,3A,3F,3L,3K\nABDEFIJL:3E,3J,3B,3D,3A,3F,3L,3I\nABDEFIJK:3E,3J,3B,3D,3A,3F,3I,3K\nABDEFHKL:3H,3E,3B,3D,3A,3F,3L,3K\nABDEFHJL:3H,3J,3B,3D,3A,3F,3L,3E\nABDEFHJK:3H,3J,3B,3D,3A,3F,3E,3K\nABDEFHIL:3H,3E,3B,3D,3A,3F,3L,3I\nABDEFHIK:3H,3E,3B,3D,3A,3F,3I,3K\nABDEFHIJ:3H,3J,3B,3D,3A,3F,3E,3I\nABDEFGKL:3E,3G,3B,3D,3A,3F,3L,3K\nABDEFGJL:3E,3G,3B,3D,3A,3F,3L,3J\nABDEFGJK:3E,3G,3B,3D,3A,3F,3J,3K\nABDEFGIL:3E,3G,3B,3D,3A,3F,3L,3I\nABDEFGIK:3E,3G,3B,3D,3A,3F,3I,3K\nABDEFGIJ:3E,3G,3B,3D,3A,3F,3I,3J\nABDEFGHL:3H,3G,3B,3D,3A,3F,3L,3E\nABDEFGHK:3H,3G,3B,3D,3A,3F,3E,3K\nABDEFGHJ:3H,3G,3B,3D,3A,3F,3E,3J\nABDEFGHI:3H,3G,3B,3D,3A,3F,3E,3I\nABCHIJKL:3I,3J,3B,3C,3A,3H,3L,3K\nABCGIJKL:3I,3J,3B,3C,3A,3G,3L,3K\nABCGHJKL:3H,3J,3B,3C,3A,3G,3L,3K\nABCGHIKL:3I,3G,3B,3C,3A,3H,3L,3K\nABCGHIJL:3H,3J,3B,3C,3A,3G,3L,3I\nABCGHIJK:3H,3J,3B,3C,3A,3G,3I,3K\nABCFIJKL:3I,3J,3B,3C,3A,3F,3L,3K\nABCFHJKL:3H,3J,3B,3C,3A,3F,3L,3K\nABCFHIKL:3H,3I,3B,3C,3A,3F,3L,3K\nABCFHIJL:3H,3J,3B,3C,3A,3F,3L,3I\nABCFHIJK:3H,3J,3B,3C,3A,3F,3I,3K\nABCFGJKL:3C,3J,3B,3F,3A,3G,3L,3K\nABCFGIKL:3I,3G,3B,3C,3A,3F,3L,3K\nABCFGIJL:3C,3J,3B,3F,3A,3G,3L,3I\nABCFGIJK:3C,3J,3B,3F,3A,3G,3I,3K\nABCFGHKL:3H,3G,3B,3C,3A,3F,3L,3K\nABCFGHJL:3H,3G,3B,3C,3A,3F,3L,3J\nABCFGHJK:3H,3G,3B,3C,3A,3F,3J,3K\nABCFGHIL:3H,3G,3B,3C,3A,3F,3L,3I\nABCFGHIK:3H,3G,3B,3C,3A,3F,3I,3K\nABCFGHIJ:3H,3G,3B,3C,3A,3F,3I,3J\nABCEIJKL:3E,3J,3B,3A,3I,3C,3L,3K\nABCEHJKL:3E,3J,3B,3C,3A,3H,3L,3K\nABCEHIKL:3E,3I,3B,3C,3A,3H,3L,3K\nABCEHIJL:3E,3J,3B,3C,3A,3H,3L,3I\nABCEHIJK:3E,3J,3B,3C,3A,3H,3I,3K\nABCEGJKL:3E,3J,3B,3C,3A,3G,3L,3K\nABCEGIKL:3E,3G,3B,3A,3I,3C,3L,3K\nABCEGIJL:3E,3J,3B,3C,3A,3G,3L,3I\nABCEGIJK:3E,3J,3B,3C,3A,3G,3I,3K\nABCEGHKL:3E,3G,3B,3C,3A,3H,3L,3K\nABCEGHJL:3H,3J,3B,3C,3A,3G,3L,3E\nABCEGHJK:3H,3J,3B,3C,3A,3G,3E,3K\nABCEGHIL:3E,3G,3B,3C,3A,3H,3L,3I\nABCEGHIK:3E,3G,3B,3C,3A,3H,3I,3K\nABCEGHIJ:3H,3J,3B,3C,3A,3G,3E,3I\nABCEFJKL:3E,3J,3B,3C,3A,3F,3L,3K\nABCEFIKL:3E,3I,3B,3C,3A,3F,3L,3K\nABCEFIJL:3E,3J,3B,3C,3A,3F,3L,3I\nABCEFIJK:3E,3J,3B,3C,3A,3F,3I,3K\nABCEFHKL:3H,3E,3B,3C,3A,3F,3L,3K\nABCEFHJL:3H,3J,3B,3C,3A,3F,3L,3E\nABCEFHJK:3H,3J,3B,3C,3A,3F,3E,3K\nABCEFHIL:3H,3E,3B,3C,3A,3F,3L,3I\nABCEFHIK:3H,3E,3B,3C,3A,3F,3I,3K\nABCEFHIJ:3H,3J,3B,3C,3A,3F,3E,3I\nABCEFGKL:3E,3G,3B,3C,3A,3F,3L,3K\nABCEFGJL:3E,3G,3B,3C,3A,3F,3L,3J\nABCEFGJK:3E,3G,3B,3C,3A,3F,3J,3K\nABCEFGIL:3E,3G,3B,3C,3A,3F,3L,3I\nABCEFGIK:3E,3G,3B,3C,3A,3F,3I,3K\nABCEFGIJ:3E,3G,3B,3C,3A,3F,3I,3J\nABCEFGHL:3H,3G,3B,3C,3A,3F,3L,3E\nABCEFGHK:3H,3G,3B,3C,3A,3F,3E,3K\nABCEFGHJ:3H,3G,3B,3C,3A,3F,3E,3J\nABCEFGHI:3H,3G,3B,3C,3A,3F,3E,3I\nABCDIJKL:3I,3J,3B,3C,3A,3D,3L,3K\nABCDHJKL:3H,3J,3B,3C,3A,3D,3L,3K\nABCDHIKL:3H,3I,3B,3C,3A,3D,3L,3K\nABCDHIJL:3H,3J,3B,3C,3A,3D,3L,3I\nABCDHIJK:3H,3J,3B,3C,3A,3D,3I,3K\nABCDGJKL:3C,3J,3B,3D,3A,3G,3L,3K\nABCDGIKL:3I,3G,3B,3C,3A,3D,3L,3K\nABCDGIJL:3C,3J,3B,3D,3A,3G,3L,3I\nABCDGIJK:3C,3J,3B,3D,3A,3G,3I,3K\nABCDGHKL:3H,3G,3B,3C,3A,3D,3L,3K\nABCDGHJL:3H,3G,3B,3C,3A,3D,3L,3J\nABCDGHJK:3H,3G,3B,3C,3A,3D,3J,3K\nABCDGHIL:3H,3G,3B,3C,3A,3D,3L,3I\nABCDGHIK:3H,3G,3B,3C,3A,3D,3I,3K\nABCDGHIJ:3H,3G,3B,3C,3A,3D,3I,3J\nABCDFJKL:3C,3J,3B,3D,3A,3F,3L,3K\nABCDFIKL:3C,3I,3B,3D,3A,3F,3L,3K\nABCDFIJL:3C,3J,3B,3D,3A,3F,3L,3I\nABCDFIJK:3C,3J,3B,3D,3A,3F,3I,3K\nABCDFHKL:3H,3F,3B,3C,3A,3D,3L,3K\nABCDFHJL:3C,3J,3B,3D,3A,3F,3L,3H\nABCDFHJK:3H,3J,3B,3C,3A,3F,3D,3K\nABCDFHIL:3H,3F,3B,3C,3A,3D,3L,3I\nABCDFHIK:3H,3F,3B,3C,3A,3D,3I,3K\nABCDFHIJ:3H,3J,3B,3C,3A,3F,3D,3I\nABCDFGKL:3C,3G,3B,3D,3A,3F,3L,3K\nABCDFGJL:3C,3G,3B,3D,3A,3F,3L,3J\nABCDFGJK:3C,3G,3B,3D,3A,3F,3J,3K\nABCDFGIL:3C,3G,3B,3D,3A,3F,3L,3I\nABCDFGIK:3C,3G,3B,3D,3A,3F,3I,3K\nABCDFGIJ:3C,3G,3B,3D,3A,3F,3I,3J\nABCDFGHL:3C,3G,3B,3D,3A,3F,3L,3H\nABCDFGHK:3H,3G,3B,3C,3A,3F,3D,3K\nABCDFGHJ:3H,3G,3B,3C,3A,3F,3D,3J\nABCDFGHI:3H,3G,3B,3C,3A,3F,3D,3I\nABCDEJKL:3E,3J,3B,3C,3A,3D,3L,3K\nABCDEIKL:3E,3I,3B,3C,3A,3D,3L,3K\nABCDEIJL:3E,3J,3B,3C,3A,3D,3L,3I\nABCDEIJK:3E,3J,3B,3C,3A,3D,3I,3K\nABCDEHKL:3H,3E,3B,3C,3A,3D,3L,3K\nABCDEHJL:3H,3J,3B,3C,3A,3D,3L,3E\nABCDEHJK:3H,3J,3B,3C,3A,3D,3E,3K\nABCDEHIL:3H,3E,3B,3C,3A,3D,3L,3I\nABCDEHIK:3H,3E,3B,3C,3A,3D,3I,3K\nABCDEHIJ:3H,3J,3B,3C,3A,3D,3E,3I\nABCDEGKL:3E,3G,3B,3C,3A,3D,3L,3K\nABCDEGJL:3E,3G,3B,3C,3A,3D,3L,3J\nABCDEGJK:3E,3G,3B,3C,3A,3D,3J,3K\nABCDEGIL:3E,3G,3B,3C,3A,3D,3L,3I\nABCDEGIK:3E,3G,3B,3C,3A,3D,3I,3K\nABCDEGIJ:3E,3G,3B,3C,3A,3D,3I,3J\nABCDEGHL:3H,3G,3B,3C,3A,3D,3L,3E\nABCDEGHK:3H,3G,3B,3C,3A,3D,3E,3K\nABCDEGHJ:3H,3G,3B,3C,3A,3D,3E,3J\nABCDEGHI:3H,3G,3B,3C,3A,3D,3E,3I\nABCDEFKL:3C,3E,3B,3D,3A,3F,3L,3K\nABCDEFJL:3C,3J,3B,3D,3A,3F,3L,3E\nABCDEFJK:3C,3J,3B,3D,3A,3F,3E,3K\nABCDEFIL:3C,3E,3B,3D,3A,3F,3L,3I\nABCDEFIK:3C,3E,3B,3D,3A,3F,3I,3K\nABCDEFIJ:3C,3J,3B,3D,3A,3F,3E,3I\nABCDEFHL:3H,3F,3B,3C,3A,3D,3L,3E\nABCDEFHK:3H,3E,3B,3C,3A,3F,3D,3K\nABCDEFHJ:3H,3J,3B,3C,3A,3F,3D,3E\nABCDEFHI:3H,3E,3B,3C,3A,3F,3D,3I\nABCDEFGL:3C,3G,3B,3D,3A,3F,3L,3E\nABCDEFGK:3C,3G,3B,3D,3A,3F,3E,3K\nABCDEFGJ:3C,3G,3B,3D,3A,3F,3E,3J\nABCDEFGI:3C,3G,3B,3D,3A,3F,3E,3I\nABCDEFGH:3H,3G,3B,3C,3A,3F,3D,3E`;

const SCORE_KEY = "wc2026:scores";
const ADVANCER_KEY = "wc2026:advancers";
const SCORE_SOURCE_KEY = "wc2026:scoreSource";
const TIMEZONE_KEY = "wc2026:timezone";
const TIMEZONE_CONFIRMED_KEY = "wc2026:timezoneConfirmed";
const THEME_KEY = "wc2026:theme";
const SCORE_EDIT_LOCK_MINUTES = 1;
const MATCH_ONGOING_DURATION_MINUTES = 113;
const SCORE_EDIT_LOCK_INTERVAL_MS = 15000;
const OFFICIAL_RESULTS_REFRESH_MS = 60000;
const THIRD_PLACE_SLOT_ORDER = ["1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L"];

const FLAG_CODES = {
  ALG: "dz",
  ARG: "ar",
  AUS: "au",
  AUT: "at",
  BEL: "be",
  BIH: "ba",
  BRA: "br",
  CAN: "ca",
  CIV: "ci",
  COD: "cd",
  COL: "co",
  CPV: "cv",
  CRO: "hr",
  CUR: "cw",
  CZE: "cz",
  ECU: "ec",
  EGY: "eg",
  ENG: "gb-eng",
  ESP: "es",
  FRA: "fr",
  GER: "de",
  GHA: "gh",
  HAI: "ht",
  IRN: "ir",
  IRQ: "iq",
  JOR: "jo",
  JPN: "jp",
  KSA: "sa",
  KOR: "kr",
  MAR: "ma",
  MEX: "mx",
  NED: "nl",
  NOR: "no",
  NZL: "nz",
  PAN: "pa",
  PAR: "py",
  POR: "pt",
  QAT: "qa",
  RSA: "za",
  SAU: "sa",
  SCO: "gb-sct",
  SEN: "sn",
  SWE: "se",
  SUI: "ch",
  TUN: "tn",
  TUR: "tr",
  URU: "uy",
  USA: "us",
  UZB: "uz"
};

const FALLBACK_TIMEZONES = [
  "Pacific/Auckland",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Mexico_City",
  "America/Toronto",
  "America/Vancouver",
  "UTC",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Paris",
  "Africa/Johannesburg",
  "Asia/Tokyo",
  "Australia/Sydney"
];

const state = {
  search: "",
  stageFilter: "all",
  scores: readJSON(SCORE_KEY, {}),
  advancers: readJSON(ADVANCER_KEY, {}),
  officialResults: {},
  scoreSource: getInitialScoreSource(),
  timezone: localStorage.getItem(TIMEZONE_KEY) || getBrowserTimezone(),
  timezoneConfirmed: localStorage.getItem(TIMEZONE_CONFIRMED_KEY) === "true",
  theme: localStorage.getItem(THEME_KEY) || "system"
};

const teams = parseCSV(TEAMS_CSV).map((team) => ({
  id: Number(team.id),
  name: team.team_name,
  fifaCode: team.fifa_code,
  group: team.group_letter,
  isPlaceholder: team.is_placeholder === "True"
}));

const cities = parseCSV(CITIES_CSV).map((city) => ({
  id: Number(city.id),
  name: city.city_name,
  country: city.country,
  venue: city.venue_name
}));

const stages = parseCSV(STAGES_CSV).map((stage) => ({
  id: Number(stage.id),
  name: stage.stage_name,
  order: Number(stage.stage_order)
}));

const matches = parseCSV(MATCHES_CSV).map((match) => ({
  id: Number(match.id),
  number: Number(match.match_number),
  homeTeamId: match.home_team_id ? Number(match.home_team_id) : null,
  awayTeamId: match.away_team_id ? Number(match.away_team_id) : null,
  cityId: Number(match.city_id),
  stageId: Number(match.stage_id),
  kickoff: parseKickoff(match.kickoff_at),
  label: match.match_label
}));

const teamsById = new Map(teams.map((team) => [team.id, team]));
const citiesById = new Map(cities.map((city) => [city.id, city]));
const stagesById = new Map(stages.map((stage) => [stage.id, stage]));
const matchesById = new Map(matches.map((match) => [match.id, match]));
const matchesByNumber = new Map(matches.map((match) => [match.number, match]));
const thirdPlaceCombinations = new Map(
  THIRD_PLACE_COMBINATIONS.trim().split("\n").map((line) => {
    const [key, slots] = line.split(":");
    return [
      key,
      Object.fromEntries(slots.split(",").map((slot, index) => [THIRD_PLACE_SLOT_ORDER[index], slot]))
    ];
  })
);

const elements = {
  timezonePanel: document.querySelector("#timezonePanel"),
  timezoneSelect: document.querySelector("#timezoneSelect"),
  timezoneHint: document.querySelector("#timezoneHint"),
  confirmTimezone: document.querySelector("#confirmTimezone"),
  themeToggle: document.querySelector("#themeToggle"),
  themeMenu: document.querySelector("#themeMenu"),
  themeOptions: document.querySelector("#themeOptions"),
  themeIcon: document.querySelector("#themeIcon"),
  themeLabel: document.querySelector("#themeLabel"),
  searchInput: document.querySelector("#searchInput"),
  stageFilter: document.querySelector("#stageFilter"),
  scoreModeHint: document.querySelector("#scoreModeHint"),
  scoreSourceButtons: document.querySelectorAll("[data-score-source-btn]"),
  resetScores: document.querySelector("#resetScores"),
  groupsGrid: document.querySelector("#groupsGrid"),
  matchesContainer: document.querySelector("#matchesContainer"),
  emptyState: document.querySelector("#emptyState"),
  matchCount: document.querySelector("#matchCount")
};

let matchEditabilityObserver = null;
const overrideEditableMatchIds = new Set();

init();

function init() {
  applyTheme();
  populateTimezoneSelect();
  populateStageFilter();
  applyScoreSourceState();
  renderGroups();
  renderMatches();
  loadOfficialResults();
  window.setInterval(loadOfficialResults, OFFICIAL_RESULTS_REFRESH_MS);
  startMatchEditabilityObserver();
  updateTimezoneState();

  elements.timezoneSelect.addEventListener("change", () => {
    state.timezone = elements.timezoneSelect.value;
    state.timezoneConfirmed = true;
    persistTimezone();
    updateTimezoneState();
    renderGroups();
    renderMatches();
  });

  elements.confirmTimezone.addEventListener("click", () => {
    state.timezone = elements.timezoneSelect.value;
    state.timezoneConfirmed = true;
    persistTimezone();
    updateTimezoneState();
    renderGroups();
    renderMatches();
  });

  elements.themeToggle.addEventListener("click", () => {
    const isOpen = !elements.themeOptions.hidden;
    setThemeMenuOpen(!isOpen);
  });

  elements.themeOptions.querySelectorAll("[data-theme-option]").forEach((button) => {
    button.addEventListener("click", () => {
      state.theme = button.dataset.themeOption;
      localStorage.setItem(THEME_KEY, state.theme);
      applyTheme();
      setThemeMenuOpen(false);
    });
  });

  document.addEventListener("click", (event) => {
    if (!elements.themeMenu.contains(event.target)) {
      setThemeMenuOpen(false);
    }
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (state.theme === "system") {
      applyTheme();
    }
  });

  elements.searchInput.addEventListener("input", () => {
    state.search = elements.searchInput.value.trim().toLowerCase();
    renderGroups();
    renderMatches();
  });

  elements.stageFilter.addEventListener("change", () => {
    state.stageFilter = elements.stageFilter.value;
    renderGroups();
    renderMatches();
  });

  elements.scoreSourceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const source = button.dataset.scoreSourceBtn === "official" ? "official" : "user";
      if (state.scoreSource === source) return;

      state.scoreSource = source;
      localStorage.setItem(SCORE_SOURCE_KEY, state.scoreSource);
      applyScoreSourceState();
      renderGroups();
      renderMatches();
    });
  });

  elements.resetScores.addEventListener("click", () => {
    const confirmed = window.confirm("Reset all saved picks?");
    if (!confirmed) return;
    state.scores = {};
    state.advancers = {};
    localStorage.removeItem(SCORE_KEY);
    localStorage.removeItem(ADVANCER_KEY);
    renderGroups();
    renderMatches();
  });
}

function parseCSV(csv) {
  const rows = csv.trim().split(/\r?\n/).map(parseCSVLine);
  const headers = rows.shift();
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
}

function parseCSVLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

function parseKickoff(value) {
  const normalized = value.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
  return new Date(normalized);
}

function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function getTimezones() {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone");
  }

  return FALLBACK_TIMEZONES;
}

function populateTimezoneSelect() {
  const timezones = getTimezones();
  if (!timezones.includes(state.timezone)) {
    timezones.unshift(state.timezone);
  }

  elements.timezoneSelect.innerHTML = timezones
    .map((timezone) => `<option value="${escapeHTML(timezone)}">${escapeHTML(timezone)}</option>`)
    .join("");
  elements.timezoneSelect.value = state.timezone;
}

function populateStageFilter() {
  const groupOptions = [...new Set(teams.map((team) => team.group))]
    .map((group) => `<option value="group:${group}">Group ${group}</option>`)
    .join("");
  const stageOptions = stages
    .map((stage) => `<option value="stage:${stage.id}">${escapeHTML(stage.name)}</option>`)
    .join("");

  elements.stageFilter.innerHTML = `
    <option value="all">All matches</option>
    <option value="groups">All groups</option>
    ${groupOptions}
    ${stageOptions}
  `;
}

function renderGroups() {
  const groups = groupBy(teams, (team) => team.group);
  const groupCards = [...groups.entries()]
    .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
    .filter(([group, groupTeams]) => shouldShowGroup(group, groupTeams))
    .map(([group, groupTeams]) => renderGroupCard(group, groupTeams));

  elements.groupsGrid.innerHTML = groupCards.join("");
}

function renderMatches() {
  const visibleGroupMatches = matches.filter((match) => match.stageId === 1 && matchMatchesFilters(match));
  const visibleKnockoutMatches = matches.filter((match) => match.stageId !== 1 && matchMatchesFilters(match));
  const visibleMatches = [...visibleGroupMatches, ...visibleKnockoutMatches];
  elements.matchCount.textContent = String(visibleMatches.length);
  elements.emptyState.hidden = visibleMatches.length > 0 || elements.groupsGrid.children.length > 0;

  const sections = buildMatchSections(visibleKnockoutMatches);
  elements.matchesContainer.innerHTML = sections.length
    ? `<div class="knockout-board">${sections.map(renderMatchSection).join("")}</div>`
    : "";
  document.querySelector(".matches-panel").hidden = visibleKnockoutMatches.length === 0;

  document.querySelectorAll("[data-score-input]").forEach((input) => {
    input.addEventListener("input", handleScoreInput);
  });

  document.querySelectorAll("[data-advancer-select]").forEach((select) => {
    select.addEventListener("change", handleAdvancerInput);
  });

  document.querySelectorAll("[data-override-match]").forEach((button) => {
    button.addEventListener("click", handleOverrideMatch);
  });
}

function shouldShowGroup(group, groupTeams) {
  if (state.stageFilter.startsWith("stage:") && state.stageFilter !== "stage:1") return false;
  if (state.stageFilter.startsWith("group:") && state.stageFilter !== `group:${group}`) return false;

  if (!state.search) return true;

  const groupMatches = getGroupMatches(group);
  const teamHaystack = groupTeams.map((team) => `${team.name} ${team.fifaCode} Group ${group}`).join(" ").toLowerCase();
  return teamHaystack.includes(state.search) || groupMatches.some(matchMatchesFilters);
}

function renderGroupCard(group, groupTeams) {
  const groupMatches = getGroupMatches(group).filter(matchMatchesFilters);
  const standings = calculateGroupStandings(group, groupTeams);

  return `
    <article class="group-card">
      <h3>Group ${escapeHTML(group)}</h3>
      <div class="standings-wrap">
        <table class="standings-table" aria-label="Group ${escapeHTML(group)} standings">
          <thead>
            <tr>
              <th class="standing-rank">#</th>
              <th class="team-col">Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>PTS</th>
            </tr>
          </thead>
          <tbody>
            ${standings.map(renderStandingRow).join("")}
          </tbody>
        </table>
      </div>
      <div class="group-matches">
        <div class="group-matches-title">Matches</div>
        ${groupMatches.length ? groupMatches.map(renderMatch).join("") : `<p class="empty-group">No matches found for this group.</p>`}
      </div>
    </article>
  `;
}

function renderStandingRow(row, index) {
  const status = index < 2 ? "qualified" : index === 2 ? "third-place" : "";
  const statusLabel = index < 2 ? "Qualified position" : index === 2 ? "Third-place race" : "Outside qualification places";

  return `
    <tr class="standing-row ${status}">
      <td class="standing-rank"><span class="rank-badge" title="${statusLabel}">${index + 1}</span></td>
      <td class="team-col">${renderTeam(row.team)}</td>
      <td>${row.played}</td>
      <td>${row.won}</td>
      <td>${row.drawn}</td>
      <td>${row.lost}</td>
      <td>${row.gf}</td>
      <td>${row.ga}</td>
      <td>${row.gd}</td>
      <td>${row.points}</td>
    </tr>
  `;
}

function buildMatchSections(visibleMatches) {
  const groups = new Map();

  visibleMatches.forEach((match) => {
    const key = match.stageId === 1 ? match.label : String(match.stageId);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(match);
  });

  return [...groups.entries()]
    .map(([key, sectionMatches]) => ({
      key,
      title: sectionMatches[0].stageId === 1 ? key : stagesById.get(sectionMatches[0].stageId).name,
      matches: sortMatchesByKickoff(sectionMatches)
    }))
    .sort((a, b) => {
      const aStage = a.matches[0].stageId;
      const bStage = b.matches[0].stageId;
      if (aStage !== bStage) return aStage - bStage;
      return a.title.localeCompare(b.title);
    });
}

function renderMatchSection(section) {
  const stageClass = getStageClass(section.title);

  return `
    <section class="stage-section ${stageClass}" aria-label="${escapeHTML(section.title)}">
      <div class="stage-title">
        <h3>${escapeHTML(section.title)}</h3>
        <span>${section.matches.length} ${section.matches.length === 1 ? "match" : "matches"}</span>
      </div>
      <div class="match-list">
        ${section.matches.map(renderMatch).join("")}
      </div>
    </section>
  `;
}

function getStageClass(title) {
  return `stage-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function renderMatch(match) {
  const city = citiesById.get(match.cityId);
  const resolvedTeams = resolveMatchTeams(match);
  const score = getDisplayScore(match);
  const formatted = formatKickoff(match.kickoff);
  const readOnlyScores = isOfficialScoreMode();
  const matchLocked = isMatchLocked(match);
  const isOverridden = overrideEditableMatchIds.has(match.id);
  const unlockableInMyPicks = !readOnlyScores && matchLocked && !isOverridden;
  const scoreInputDisabled = !isMatchEditable(match);
  const matchOngoing = isMatchOngoing(match);
  const homeScoreInput = renderScoreInput(match, "home", score.home ?? "", scoreInputDisabled, unlockableInMyPicks);
  const awayScoreInput = renderScoreInput(match, "away", score.away ?? "", scoreInputDisabled, unlockableInMyPicks);
  const overrideControl = renderOverrideControl(match, readOnlyScores, isOverridden);
  const advancerPicker = renderAdvancerPicker(match, resolvedTeams, score, scoreInputDisabled, readOnlyScores);
  const officialResult = isOfficialScoreMode() ? "" : renderOfficialResult(match, resolvedTeams);

  return `
    <article class="match-row" data-match-id="${match.id}">
      <div class="match-topline">
        <span><span class="match-number">Match ${match.number}</span> · ${escapeHTML(formatted.date)} · ${escapeHTML(formatted.time)}</span>
        <div class="match-meta">
          <span>${escapeHTML(city.name)}</span>
          <span class="match-live-indicator" data-match-live data-match-id="${match.id}" ${matchOngoing ? "" : "hidden"}>
            <span class="live-ball" aria-hidden="true">⚽</span>
            <span>Live</span>
          </span>
        </div>
      </div>
      <div class="match-main" aria-label="Score for match ${match.number}">
        ${renderTeam(resolvedTeams.home.team, resolvedTeams.home.label)}
        <div class="score-entry">
          ${homeScoreInput}
          <span class="score-separator">:</span>
          ${awayScoreInput}
        </div>
        ${renderTeam(resolvedTeams.away.team, resolvedTeams.away.label, "away")}
      </div>
      ${overrideControl}
      ${advancerPicker}
      ${officialResult}
    </article>
  `;
}

function renderScoreInput(match, side, value, disabled, showUnlockPopover) {
  const ariaSide = side === "home" ? "Home" : "Away";

  return `
    <div class="score-field ${showUnlockPopover ? "locked" : ""}">
      <input
        type="number"
        min="0"
        inputmode="numeric"
        aria-label="${ariaSide} score for match ${match.number}"
        data-score-input
        data-match-id="${match.id}"
        data-side="${side}"
        value="${escapeHTML(value)}"
        ${disabled ? "disabled" : ""}
      >
      ${showUnlockPopover ? `
        <details class="score-lock">
          <summary class="score-lock-trigger" aria-label="Locked pick. Open options">🔒</summary>
          <div class="score-lock-popover">
            <button class="score-lock-action" type="button" data-override-match="${match.id}" data-focus-side="${side}">Unlock pick</button>
          </div>
        </details>
      ` : ""}
    </div>
  `;
}

function renderOverrideControl(match, readOnlyScores, isOverridden) {
  if (readOnlyScores) return "";
  if (!isMatchLocked(match)) return "";
  if (!isOverridden) return "";

  return `
    <div class="match-override-wrap">
      <button class="match-override-button is-unlocked" type="button" data-override-match="${match.id}" aria-label="Lock pick" title="Lock pick">✓</button>
    </div>
  `;
}

function renderOfficialResult(match, resolvedTeams) {
  const official = state.officialResults[match.number];

  if (!official) {
    return `
      <div class="official-result pending" aria-live="polite">
        <span class="official-label">Official result</span>
        <div class="official-placeholder">Pending confirmation</div>
      </div>
    `;
  }

  const homeName = resolvedTeams.home.team?.name || resolvedTeams.home.label || "Home";
  const awayName = resolvedTeams.away.team?.name || resolvedTeams.away.label || "Away";
  const homeShort = resolvedTeams.home.team?.fifaCode || getShortTeamLabel(homeName);
  const awayShort = resolvedTeams.away.team?.fifaCode || getShortTeamLabel(awayName);
  const outcome = getOfficialOutcome(official.home, official.away);
  const homeBadge = outcome === "draw" ? "D" : outcome === "home" ? "W" : "L";
  const awayBadge = outcome === "draw" ? "D" : outcome === "away" ? "W" : "L";
  const homeClass = outcome === "draw" ? "draw" : outcome === "home" ? "win" : "loss";
  const awayClass = outcome === "draw" ? "draw" : outcome === "away" ? "win" : "loss";

  return `
    <div class="official-result" aria-live="polite">
      <span class="official-label">Official result</span>
      <div class="official-scoreline">
        <span class="official-side" title="${escapeHTML(homeName)}">
          <span class="official-badge ${homeClass}" aria-label="${homeBadge}">${homeBadge}</span>
          <span class="official-team official-team-full">${escapeHTML(homeName)}</span>
          <span class="official-team official-team-short">${escapeHTML(homeShort)}</span>
          <span class="official-score-box">${official.home}</span>
        </span>
        <span class="official-divider">-</span>
        <span class="official-side away" title="${escapeHTML(awayName)}">
          <span class="official-score-box">${official.away}</span>
          <span class="official-team official-team-full">${escapeHTML(awayName)}</span>
          <span class="official-team official-team-short">${escapeHTML(awayShort)}</span>
          <span class="official-badge ${awayClass}" aria-label="${awayBadge}">${awayBadge}</span>
        </span>
      </div>
    </div>
  `;
}

function getOfficialOutcome(homeScore, awayScore) {
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}

function getShortTeamLabel(label) {
  const cleaned = String(label || "").trim();
  if (!cleaned) return "TBD";

  const alnum = cleaned.replace(/[^A-Za-z0-9]/g, "");
  if (alnum.length >= 3) return alnum.slice(0, 3).toUpperCase();
  return cleaned.slice(0, 3).toUpperCase();
}

function renderTeam(team, fallbackLabel = "TBD", modifier = "") {
  if (!team) {
    return `
      <span class="team-name placeholder-team ${modifier}">
        <span class="flag-placeholder" aria-hidden="true">?</span>
        <span class="team-text">${escapeHTML(fallbackLabel || "TBD")}</span>
        <span class="team-code">TBD</span>
      </span>
    `;
  }

  const flagCode = FLAG_CODES[team.fifaCode];
  const flag = flagCode
    ? `<span class="flag fi fi-${flagCode}" aria-hidden="true"></span>`
    : `<span class="flag-placeholder" aria-hidden="true">?</span>`;

  return `
    <span class="team-name ${team.isPlaceholder ? "placeholder-team" : ""} ${modifier}">
      ${flag}
      <span class="team-text">${escapeHTML(team.name)}</span>
      <span class="team-code">${escapeHTML(team.fifaCode)}</span>
    </span>
  `;
}

function getGroupMatches(group) {
  return sortMatchesByKickoff(matches.filter((match) => match.stageId === 1 && match.label === `Group ${group}`));
}

function calculateGroupStandings(group, groupTeams) {
  const table = new Map(groupTeams.map((team, position) => [
    team.id,
    {
      team,
      position,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0
    }
  ]));

  getGroupMatches(group).forEach((match) => {
    const score = getActiveScore(match);
    if (!isCompleteScore(score)) return;

    const home = table.get(match.homeTeamId);
    const away = table.get(match.awayTeamId);
    const homeGoals = Number(score.home);
    const awayGoals = Number(score.away);

    home.played += 1;
    away.played += 1;
    home.gf += homeGoals;
    home.ga += awayGoals;
    away.gf += awayGoals;
    away.ga += homeGoals;

    if (homeGoals > awayGoals) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (awayGoals > homeGoals) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  });

  return [...table.values()]
    .map((row) => ({ ...row, gd: row.gf - row.ga }))
    .sort((a, b) =>
      b.points - a.points ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      a.position - b.position
    );
}

function getGroupStandingsMap() {
  const groups = groupBy(teams, (team) => team.group);
  return new Map(
    [...groups.entries()].map(([group, groupTeams]) => [group, calculateGroupStandings(group, groupTeams)])
  );
}

function areAllGroupMatchesComplete() {
  return matches
    .filter((match) => match.stageId === 1)
    .every((match) => isCompleteScore(getActiveScore(match)));
}

function areGroupMatchesComplete(group) {
  return getGroupMatches(group).every((match) => isCompleteScore(getActiveScore(match)));
}

function getQualifiedThirdPlaceGroups(standingsByGroup) {
  return [...standingsByGroup.entries()]
    .map(([group, standings]) => ({ group, ...standings[2] }))
    .sort(compareThirdPlaceRows)
    .slice(0, 8);
}

function compareThirdPlaceRows(a, b) {
  return (
    b.points - a.points ||
    b.gd - a.gd ||
    b.gf - a.gf ||
    a.group.localeCompare(b.group)
  );
}

function isCompleteScore(score) {
  return score && score.home !== undefined && score.home !== "" && score.away !== undefined && score.away !== "";
}

function resolveMatchTeams(match, visited = new Set()) {
  const [homeLabel, awayLabel] = match.label.split(" vs ");

  return {
    home: resolveMatchSide(match, "home", homeLabel, visited),
    away: resolveMatchSide(match, "away", awayLabel, visited)
  };
}

function resolveMatchSide(match, side, label, visited) {
  const directTeamId = side === "home" ? match.homeTeamId : match.awayTeamId;
  if (directTeamId) {
    return { team: teamsById.get(directTeamId), label };
  }

  const standingsByGroup = getGroupStandingsMap();
  const groupWinner = label.match(/^Winner Group ([A-L])$/);
  if (groupWinner) {
    if (!areGroupMatchesComplete(groupWinner[1])) return { team: null, label };
    return { team: standingsByGroup.get(groupWinner[1])?.[0]?.team || null, label };
  }

  const groupRunnerUp = label.match(/^Runner-up Group ([A-L])$/);
  if (groupRunnerUp) {
    if (!areGroupMatchesComplete(groupRunnerUp[1])) return { team: null, label };
    return { team: standingsByGroup.get(groupRunnerUp[1])?.[1]?.team || null, label };
  }

  if (label.startsWith("3rd Group ")) {
    return { team: getResolvedThirdPlaceTeam(match, standingsByGroup), label };
  }

  const winnerMatch = label.match(/^Winner Match (\d+)$/);
  if (winnerMatch) {
    const outcome = getKnockoutOutcome(Number(winnerMatch[1]), visited);
    return { team: outcome.winner, label };
  }

  const loserMatch = label.match(/^Loser Match (\d+)$/);
  if (loserMatch) {
    const outcome = getKnockoutOutcome(Number(loserMatch[1]), visited);
    return { team: outcome.loser, label };
  }

  return { team: null, label };
}

function getResolvedThirdPlaceTeam(match, standingsByGroup) {
  if (!areAllGroupMatchesComplete()) return null;

  const winnerGroup = match.label.match(/Winner Group ([A-L])/);
  if (!winnerGroup) return null;

  const qualifiedThirds = getQualifiedThirdPlaceGroups(standingsByGroup);
  const combinationKey = qualifiedThirds.map((row) => row.group).sort().join("");
  const slot = thirdPlaceCombinations.get(combinationKey)?.[`1${winnerGroup[1]}`];
  if (!slot) return null;

  return standingsByGroup.get(slot.slice(1))?.[2]?.team || null;
}

function getKnockoutOutcome(matchNumber, visited = new Set()) {
  const match = matchesByNumber.get(matchNumber);
  if (!match) return { winner: null, loser: null };

  const visitKey = `match:${matchNumber}`;
  if (visited.has(visitKey)) return { winner: null, loser: null };
  visited.add(visitKey);

  const resolvedTeams = resolveMatchTeams(match, visited);
  const score = getActiveScore(match);
  const scoreWinner = getScoreWinnerSide(score);

  if (scoreWinner === "home") return { winner: resolvedTeams.home.team, loser: resolvedTeams.away.team };
  if (scoreWinner === "away") return { winner: resolvedTeams.away.team, loser: resolvedTeams.home.team };

  if (!isOfficialScoreMode()) {
    const selectedAdvancer = state.advancers[match.id];
    if (selectedAdvancer === "home") return { winner: resolvedTeams.home.team, loser: resolvedTeams.away.team };
    if (selectedAdvancer === "away") return { winner: resolvedTeams.away.team, loser: resolvedTeams.home.team };
  }

  return { winner: null, loser: null };
}

function getScoreWinnerSide(score) {
  if (!isCompleteScore(score)) return null;

  const homeGoals = Number(score.home);
  const awayGoals = Number(score.away);
  if (homeGoals > awayGoals) return "home";
  if (awayGoals > homeGoals) return "away";
  return "tie";
}

function renderAdvancerPicker(match, resolvedTeams, score, scoreInputDisabled, readOnlyScores) {
  if (match.stageId === 1) return "";
  if (readOnlyScores) return "";
  if (scoreInputDisabled) return "";
  if (!resolvedTeams.home.team || !resolvedTeams.away.team) return "";
  if (getScoreWinnerSide(score) !== "tie") return "";

  const selectedSide = state.advancers[match.id] || "";

  return `
    <label class="advancer-picker">
      <span>Advances</span>
      <select data-advancer-select data-match-id="${match.id}" ${matchLocked ? "disabled" : ""}>
        <option value="">Select team</option>
        <option value="home" ${selectedSide === "home" ? "selected" : ""}>${escapeHTML(resolvedTeams.home.team.name)}</option>
        <option value="away" ${selectedSide === "away" ? "selected" : ""}>${escapeHTML(resolvedTeams.away.team.name)}</option>
      </select>
    </label>
  `;
}

function matchMatchesFilters(match) {
  if (state.stageFilter === "groups" && match.stageId !== 1) return false;
  if (state.stageFilter.startsWith("stage:") && match.stageId !== Number(state.stageFilter.split(":")[1])) return false;
  if (state.stageFilter.startsWith("group:") && match.label !== `Group ${state.stageFilter.split(":")[1]}`) return false;

  if (!state.search) return true;

  const city = citiesById.get(match.cityId);
  const resolvedTeams = resolveMatchTeams(match);
  const haystack = [
    match.number,
    match.label,
    stagesById.get(match.stageId).name,
    city.name,
    city.country,
    city.venue,
    resolvedTeams.home.team?.name,
    resolvedTeams.away.team?.name,
    resolvedTeams.home.team?.fifaCode,
    resolvedTeams.away.team?.fifaCode
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(state.search);
}

function handleScoreInput(event) {
  if (isOfficialScoreMode()) {
    renderMatches();
    return;
  }

  const input = event.currentTarget;
  const matchId = input.dataset.matchId;
  const match = matchesById.get(Number(matchId));
  if (!match || !isMatchEditable(match)) {
    renderMatches();
    return;
  }

  const side = input.dataset.side;
  const value = input.value.replace(/[^\d]/g, "");

  input.value = value;
  if (!state.scores[matchId]) {
    state.scores[matchId] = {};
  }

  state.scores[matchId][side] = value;

  if (!state.scores[matchId].home && !state.scores[matchId].away) {
    delete state.scores[matchId];
  }

  if (getScoreWinnerSide(state.scores[matchId]) !== "tie") {
    delete state.advancers[matchId];
    localStorage.setItem(ADVANCER_KEY, JSON.stringify(state.advancers));
  }

  localStorage.setItem(SCORE_KEY, JSON.stringify(state.scores));
  renderGroups();
  renderMatches();

  const nextInput = document.querySelector(`[data-score-input][data-match-id="${matchId}"][data-side="${side}"]`);
  if (nextInput) {
    nextInput.focus();
    if (typeof nextInput.setSelectionRange === "function" && nextInput.type !== "number") {
      nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
    }
  }
}

function handleAdvancerInput(event) {
  if (isOfficialScoreMode()) {
    renderMatches();
    return;
  }

  const select = event.currentTarget;
  const matchId = select.dataset.matchId;
  const match = matchesById.get(Number(matchId));
  if (!match || !isMatchEditable(match)) {
    renderMatches();
    return;
  }

  if (select.value) {
    state.advancers[matchId] = select.value;
  } else {
    delete state.advancers[matchId];
  }

  localStorage.setItem(ADVANCER_KEY, JSON.stringify(state.advancers));
  renderMatches();
}

function updateTimezoneState() {
  elements.timezonePanel.classList.toggle("needs-confirmation", !state.timezoneConfirmed);
  elements.timezoneHint.textContent = state.timezoneConfirmed
    ? `Kickoffs are shown in ${state.timezone}.`
    : "Confirm your timezone to localize every kickoff.";
  elements.confirmTimezone.hidden = state.timezoneConfirmed;
}

function applyScoreSourceState() {
  const usingOfficial = isOfficialScoreMode();

  elements.scoreSourceButtons.forEach((button) => {
    const active = button.dataset.scoreSourceBtn === state.scoreSource;
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("is-active", active);
  });

  elements.scoreModeHint.textContent = usingOfficial
    ? "Using only official results from admin source for standings and knockout progression."
    : "Using your saved picks for standings and knockout progression.";
}

async function loadOfficialResults() {
  try {
    const response = await fetch("/admin/api/results", {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    state.officialResults = normalizeOfficialResults(payload.results || {});
    renderGroups();
    renderMatches();
  } catch {
    // Keep previous data when official API is unavailable.
  }
}

function normalizeOfficialResults(results) {
  const normalized = {};

  Object.entries(results).forEach(([matchNumber, value]) => {
    const numberKey = Number(matchNumber);
    const home = Number(value?.home);
    const away = Number(value?.away);
    if (!Number.isInteger(numberKey) || numberKey <= 0) return;
    if (!Number.isInteger(home) || home < 0) return;
    if (!Number.isInteger(away) || away < 0) return;

    normalized[numberKey] = { home, away };
  });

  return normalized;
}

function getActiveScore(match) {
  if (isOfficialScoreMode()) {
    return state.officialResults[match.number] || null;
  }

  return state.scores[match.id] || null;
}

function getDisplayScore(match) {
  return getActiveScore(match) || {};
}

function isOfficialScoreMode() {
  return state.scoreSource === "official";
}

function getInitialScoreSource() {
  const saved = localStorage.getItem(SCORE_SOURCE_KEY);
  return saved === "official" ? "official" : "user";
}

function persistTimezone() {
  localStorage.setItem(TIMEZONE_KEY, state.timezone);
  localStorage.setItem(TIMEZONE_CONFIRMED_KEY, String(state.timezoneConfirmed));
}

function setThemeMenuOpen(isOpen) {
  elements.themeOptions.hidden = !isOpen;
  elements.themeToggle.setAttribute("aria-expanded", String(isOpen));
}

function applyTheme() {
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const activeTheme = state.theme === "system" ? systemTheme : state.theme;
  document.documentElement.dataset.theme = activeTheme;
  elements.themeIcon.textContent = activeTheme === "dark" ? "☾" : "☼";
  elements.themeLabel.textContent = state.theme === "system" ? `System (${systemTheme})` : titleCase(state.theme);

  elements.themeOptions.querySelectorAll("[data-theme-option]").forEach((button) => {
    button.setAttribute("aria-checked", String(button.dataset.themeOption === state.theme));
  });
}

function formatKickoff(date) {
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: state.timezone
  });
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: state.timezone
  });

  return {
    date: dateFormatter.format(date),
    time: timeFormatter.format(date)
  };
}

function getMatchEditDeadline(match) {
  return match.kickoff.getTime() - SCORE_EDIT_LOCK_MINUTES * 60000;
}

function getMatchFinalWhistle(match) {
  return match.kickoff.getTime() + MATCH_ONGOING_DURATION_MINUTES * 60000;
}

function isMatchLocked(match, now = Date.now()) {
  return now >= getMatchEditDeadline(match);
}

function isMatchOngoing(match, now = Date.now()) {
  const kickoffTime = match.kickoff.getTime();
  return now >= kickoffTime && now < getMatchFinalWhistle(match);
}

function refreshMatchEditability() {
  if (isOfficialScoreMode()) {
    document.querySelectorAll("[data-score-input], [data-advancer-select]").forEach((field) => {
      field.disabled = true;
    });
    return;
  }

  const now = Date.now();
  document.querySelectorAll("[data-score-input], [data-advancer-select]").forEach((field) => {
    const match = matchesById.get(Number(field.dataset.matchId));
    if (!match) return;
    field.disabled = !isMatchEditable(match, now);
  });
}

function refreshMatchLiveIndicators() {
  const now = Date.now();
  document.querySelectorAll("[data-match-live]").forEach((indicator) => {
    const match = matchesById.get(Number(indicator.dataset.matchId));
    if (!match) return;
    indicator.hidden = !isMatchOngoing(match, now);
  });
}

function startMatchEditabilityObserver() {
  refreshMatchEditability();
  refreshMatchLiveIndicators();
  if (matchEditabilityObserver !== null) {
    clearInterval(matchEditabilityObserver);
  }

  matchEditabilityObserver = window.setInterval(() => {
    refreshMatchEditability();
    refreshMatchLiveIndicators();
  }, SCORE_EDIT_LOCK_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      refreshMatchEditability();
      refreshMatchLiveIndicators();
    }
  });
}

function handleOverrideMatch(event) {
  const button = event.currentTarget;
  const matchId = Number(button.dataset.overrideMatch);
  const focusSide = button.dataset.focusSide === "away" ? "away" : "home";
  if (!Number.isInteger(matchId) || matchId <= 0) return;

  const enabling = !overrideEditableMatchIds.has(matchId);
  if (overrideEditableMatchIds.has(matchId)) {
    overrideEditableMatchIds.delete(matchId);
  } else {
    overrideEditableMatchIds.add(matchId);
  }

  renderGroups();
  renderMatches();

  if (enabling) {
    const selector = `[data-score-input][data-match-id="${matchId}"][data-side="${focusSide}"]`;
    const target = document.querySelector(selector);
    if (target) {
      target.focus();
    }
  }
}

function isMatchEditable(match, now = Date.now()) {
  if (isOfficialScoreMode()) return false;
  if (!isMatchLocked(match, now)) return true;
  return overrideEditableMatchIds.has(match.id);
}

function groupBy(items, getKey) {
  return items.reduce((map, item) => {
    const key = getKey(item);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
    return map;
  }, new Map());
}

function sortMatchesByKickoff(items) {
  return [...items].sort((a, b) => a.kickoff - b.kickoff || a.number - b.number);
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
