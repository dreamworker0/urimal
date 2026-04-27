export interface TaxonomyPattern {
  id: string;
  name: string;
  severity: 'S1' | 'S2' | 'S3';
  example: string;
}

export interface TaxonomyCategory {
  code: string;
  title: string;
  definition: string;
  patterns: TaxonomyPattern[];
}

export const TAXONOMY_DATA: TaxonomyCategory[] = [
  {
    code: 'SW-01',
    title: '호응·짝 오류',
    definition: '주어·서술어, 부사·동사, 조사 등 문장 성분 간 호응이 맞지 않는 경우.',
    patterns: [
      { id: 'SW-01-A', name: '주어-술어 불일치', severity: 'S1', example: '"권한과 책임이 너무 클 수도 있습니다" → 맥락에 맞는 술어로 수정' },
      { id: 'SW-01-B', name: '부사-동사 불일치', severity: 'S2', example: '"일주일간 시작합니다" → "일주일간의 ~을 시작합니다"' },
      { id: 'SW-01-C', name: '~부터 ~까지 짝 누락', severity: 'S2', example: '"기획·진행·평가까지" → "기획부터 평가까지"' },
      { id: 'SW-01-D', name: '높임말 호응 불일치', severity: 'S1', example: '"과장님께서 해주셨습니다. 이야기를?" → "말씀을"' },
      { id: 'SW-01-E', name: '주어 누락으로 인한 행위자 혼동', severity: 'S2', example: '"고민하다가 추천해주셨습니다" → 주어 명시' },
    ],
  },
  {
    code: 'SW-02',
    title: '논리 오류',
    definition: '역접·인과·시제 등 논리 관계가 어색하거나 모순인 경우.',
    patterns: [
      { id: 'SW-02-A', name: '역접 오류 (~지만)', severity: 'S2', example: '"소박한 잔치였지만 자연스러운 모습입니다" → 소박함과 자연스러움은 반대가 아님' },
      { id: 'SW-02-B', name: '인과 오류', severity: 'S2', example: '"예상하기 어렵지만 바라봅니다" → "예상하기 어려우니 바라봅니다"' },
      { id: 'SW-02-C', name: '내일/오늘 시제 혼동', severity: 'S1', example: '"내일은 어린이날입니다… 오늘만큼은"' },
      { id: 'SW-02-D', name: '말하고 행동 모순', severity: 'S1', example: '"말해주세요" 직후 "말보다 포옹이 큰 힘"' },
    ],
  },
  {
    code: 'SW-03',
    title: '시제·태·구조 통일 오류',
    definition: '한 글 안에서 시제·경어체·문체가 통일되지 않은 경우.',
    patterns: [
      { id: 'SW-03-A', name: '했습니다/하였습니다 혼용', severity: 'S3', example: '같은 글에서 두 형태 혼용' },
      { id: 'SW-03-B', name: '높임말 통일 안 됨', severity: 'S2', example: '"어르신께서 담당합니다" / "어르신이 담당하십니다" 혼용' },
      { id: 'SW-03-C', name: '나열 구조 불균형', severity: 'S2', example: '"어떤 음식을 만들면 좋을지, 언제 할지" → 구조 통일' },
    ],
  },
  {
    code: 'SW-04',
    title: '관용구 오남용',
    definition: '사회복지 문서에 자주 등장하지만 의미가 부정확하거나 어색한 관용구.',
    patterns: [
      { id: 'SW-04-A', name: '관계하다 오남용', severity: 'S2', example: '"이웃과 관계하며" → "이웃과 어울리며", "왕래하며"' },
      { id: 'SW-04-B', name: '고민하다 오남용', severity: 'S2', example: '"고민했습니다" → "숙고했습니다", "검토했습니다"' },
      { id: 'SW-04-C', name: '이야기 나누다 남발', severity: 'S3', example: '→ "토의했습니다", "의논했습니다", "상담했습니다"' },
      { id: 'SW-04-D', name: '물론 오용', severity: 'S2', example: '당연하지 않은 것에 "물론" 사용' },
      { id: 'SW-04-E', name: '가지다·갖다 명사화 오용', severity: 'S2', example: '"시간을 가졌습니다" → "~했습니다"' },
      { id: 'SW-04-F', name: '대하여·대해서 과잉', severity: 'S3', example: '"필요성에 대해서는 원하고" → "필요성은"' },
      { id: 'SW-04-G', name: '에 있어서 과잉', severity: 'S2', example: '"실천에 있어서" → "실천에서"' },
    ],
  },
  {
    code: 'SW-05',
    title: '해 주다 과잉',
    definition: '당사자가 스스로 하는 일인데 "~해 주다"로 표현하여 주체가 혼동되는 경우.',
    patterns: [
      { id: 'SW-05-A', name: '당사자 행위에 ~해 주다', severity: 'S2', example: '"참여해 주셨습니다" → "참여하셨습니다"' },
      { id: 'SW-05-B', name: '당사자 자발 행위 혼동', severity: 'S1', example: '"추석 잔치를 이뤄주셔서" → 누가 한 일인지 불분명' },
    ],
  },
  {
    code: 'SW-06',
    title: '사업화 문체',
    definition: '자연스러운 행위를 명사+하다 형태로 과도하게 사업 용어화한 경우.',
    patterns: [
      { id: 'SW-06-A', name: '명사+활동/하다 과잉', severity: 'S2', example: '"독서활동을 했다" → "책을 읽었다"' },
      { id: 'SW-06-B', name: '나눔+명사 나열', severity: 'S2', example: '"사례 나눔을 하면" → "사례를 나누면"' },
      { id: 'SW-06-C', name: '용언 쪼개기', severity: 'S2', example: '"접수를 받고 있습니다" → "접수하고 있습니다"' },
    ],
  },
  {
    code: 'SW-07',
    title: '과거완료 남용',
    definition: '단순 과거에 ~었었~ 이중 과거를 쓰는 경우.',
    patterns: [
      { id: 'SW-07-A', name: '했었던·했었습니다', severity: 'S3', example: '"계획했었는데" → "계획했는데"' },
      { id: 'SW-07-B', name: '있었었다', severity: 'S3', example: '"참여하셨었는데" → "참여하셨는데"' },
    ],
  },
  {
    code: 'SW-08',
    title: '모호한 표현',
    definition: '뜻이 명확하지 않거나 책임을 회피하는 듯한 우회적 표현.',
    patterns: [
      { id: 'SW-08-A', name: '~것 같아요 남용', severity: 'S2', example: '"좋은 것 같아요" → "좋아요"' },
      { id: 'SW-08-B', name: '부분 남발', severity: 'S2', example: '"걱정되는 부분" → "걱정되는 점"' },
      { id: 'SW-08-C', name: '지점 남발', severity: 'S2', example: '"함께할 수 있는 지점" → "함께할 수 있는 일"' },
      { id: 'SW-08-D', name: '~도록 하겠습니다', severity: 'S2', example: '"가도록 하겠습니다" → "가겠습니다"' },
      { id: 'SW-08-E', name: '~기로 하겠습니다', severity: 'S2', example: '"마치기로 하겠습니다" → "마치겠습니다"' },
      { id: 'SW-08-F', name: '~라는 생각이 들었습니다', severity: 'S2', example: '→ "~라고 생각했습니다" 또는 직접 진술' },
      { id: 'SW-08-G', name: '~할 수 있는 시간이었습니다', severity: 'S1', example: '"배울 수 있는 시간이었습니다" → "배웠습니다"' },
      { id: 'SW-08-H', name: '~같은 경우에는', severity: 'S2', example: '"저 같은 경우에는" → "저는"' },
      { id: 'SW-08-I', name: '했으면 좋겠다 남용', severity: 'S3', example: '"가겠습니다"·"가십시오" 등 직접 표현으로 대체' },
    ],
  },
  {
    code: 'SW-09',
    title: '수동태 남용',
    definition: '능동으로 쓸 수 있는 문장을 불필요하게 수동으로 쓴 경우.',
    patterns: [
      { id: 'SW-09-A', name: '되어지다', severity: 'S1', example: '"배치되어진" → "배치된"' },
      { id: 'SW-09-B', name: '~이 요구된다', severity: 'S2', example: '"지원이 요구된다" → "지원해야 한다"' },
      { id: 'SW-09-C', name: '~을 필요로 한다', severity: 'S2', example: '"지원을 필요로 한다" → "지원이 필요하다"' },
      { id: 'SW-09-D', name: '맡겨진·주어진', severity: 'S2', example: '→ "맡은", "받은"' },
      { id: 'SW-09-E', name: '보여진다', severity: 'S1', example: '→ "보인다"' },
    ],
  },
  {
    code: 'SW-10',
    title: '중복·포함 오류',
    definition: '같은 뜻을 겹쳐 쓴 경우.',
    patterns: [
      { id: 'SW-10-A', name: '수급받다', severity: 'S2', example: '→ "수급하다" 또는 "급여를 받다"' },
      { id: 'SW-10-B', name: '결연 체결', severity: 'S2', example: '→ "결연하다"' },
      { id: 'SW-10-C', name: '접수받다', severity: 'S2', example: '→ "접수하다" 또는 "받다"' },
      { id: 'SW-10-D', name: '~시키다 불필요 사용', severity: 'S2', example: '"교육시키다" → "교육하다"' },
      { id: 'SW-10-E', name: '매년마다', severity: 'S2', example: '→ "매년"' },
      { id: 'SW-10-F', name: '과반수 이상', severity: 'S1', example: '→ "과반수"' },
      { id: 'SW-10-G', name: '가능할 수 있다', severity: 'S2', example: '→ "가능하다"' },
      { id: 'SW-10-H', name: '~이후부터 / ~이전까지', severity: 'S2', example: '→ "~이후" / "~이전"' },
    ],
  },
  {
    code: 'SW-11',
    title: '띄어쓰기 오류',
    definition: '표준 띄어쓰기 원칙을 어긴 경우.',
    patterns: [
      { id: 'SW-11-A', name: '보조용언 붙여쓰기', severity: 'S3', example: '"해보고 싶다" → "해 보고 싶다"' },
      { id: 'SW-11-B', name: '~ㄴ 데 붙여쓰기', severity: 'S3', example: '"높이는데 도움이" → "높이는 데 도움이"' },
      { id: 'SW-11-C', name: '함께하다 오류', severity: 'S3', example: '한 단어일 때 "함께하다", 부사+동사일 때 "함께 했다"' },
      { id: 'SW-11-D', name: '감동받다·후원받다 띄어쓰기', severity: 'S3', example: '"감동 받으셨겠지만" → "감동받으셨겠지만"' },
    ],
  },
  {
    code: 'SW-12',
    title: '어휘 혼동',
    definition: '뜻이 비슷하지만 다른 어휘를 혼동하여 쓴 경우.',
    patterns: [
      { id: 'SW-12-A', name: '틀리다 vs 다르다', severity: 'S2', example: '"성격이 틀리다" → "성격이 다르다"' },
      { id: 'SW-12-B', name: '전하다 오용', severity: 'S2', example: '"송편을 전하고 싶으세요?" → "주고 싶으세요?"' },
      { id: 'SW-12-C', name: '접수하다 방향 오류', severity: 'S2', example: '"신청서를 접수하다"(신청자 입장) → "제출하다"' },
      { id: 'SW-12-D', name: '고맙다 vs 감사하다', severity: 'S3', example: '"감사한 말씀" → "고마운 말씀"' },
      { id: 'SW-12-E', name: '너무 긍정 오용', severity: 'S2', example: '"너무 멋있어요" → "정말 멋있어요"' },
      { id: 'SW-12-F', name: '~다라고·~다라는', severity: 'S2', example: '간접 인용에 직접 인용 어미 사용' },
      { id: 'SW-12-G', name: '위탁 vs 수탁', severity: 'S1', example: '"복지관이 위탁운영" → "수탁운영"' },
    ],
  },
  {
    code: 'SW-13',
    title: '일반 맞춤법 및 순화어',
    definition: '기본적인 맞춤법을 어겼거나, 번역투 문장, 어려운 한자어, 일본어 잔재 등을 사용한 경우.',
    patterns: [
      { id: 'SW-13-A', name: '잦은 맞춤법 오류', severity: 'S1', example: '든지/던지, 로서/로써, 안/않, 되/돼, 데/대 혼동' },
      { id: 'SW-13-B', name: '불필요한 외래어', severity: 'S2', example: '"니즈" → "욕구/필요", "케어" → "돌봄"' },
      { id: 'SW-13-C', name: '어려운 한자어 / 행정 용어', severity: 'S2', example: '"익일" → "다음 날", "별첨" → "붙임"' },
      { id: 'SW-13-D', name: '과도한 줄임말', severity: 'S3', example: '"사복" → "사회복지사"' },
      { id: 'SW-13-E', name: '~의 남용 (일본어투)', severity: 'S2', example: '"나의 살던 고향" → "내가 살던 고향"' },
      { id: 'SW-13-F', name: '번역투 문장', severity: 'S2', example: '"~에 위치해 있다" → "~에 있다"' },
      { id: 'SW-13-G', name: '불필요한 복수형 표기', severity: 'S3', example: '"저희들" → "저희", "많은 사람들이" → "많은 사람이"' },
      { id: 'SW-13-H', name: '사물 존칭 오류', severity: 'S1', example: '"커피 나오셨습니다" → 사물에 존칭 사용 금지' },
    ],
  },
  {
    code: 'SW-14',
    title: '차별적·권위적·시혜적 표현',
    definition: '특정 집단에 대한 편견, 차별적 어휘, 사회복지 제공자의 권위적·시혜적 태도가 드러나는 표현.',
    patterns: [
      { id: 'SW-14-A', name: '장애인 차별·비하 표현', severity: 'S1', example: '"정상인" → "비장애인", "장애우/장애자" → "장애인"' },
      { id: 'SW-14-B', name: '가족 형태 차별 표현', severity: 'S1', example: '"결손가족" → "한부모가족", "미혼모" → "비혼모"' },
      { id: 'SW-14-C', name: '성차별적 표현', severity: 'S1', example: '"여의사" → "의사", "유모차" → "유아차"' },
      { id: 'SW-14-D', name: '시혜적·권위적 묘사', severity: 'S1', example: '"불우이웃" → "도움이 필요한 이웃"' },
      { id: 'SW-14-E', name: '직업 비하 표현', severity: 'S1', example: '"청소부" → "환경미화원"' },
      { id: 'SW-14-F', name: '나이/세대 차별 표현', severity: 'S1', example: '"노인네", "할망구" 등 세대 비하적 뉘앙스' },
      { id: 'SW-14-G', name: '인종/지역 차별 표현', severity: 'S1', example: '"혼혈" → "다문화", "살색" → "살구색"' },
    ],
  },
];
