// 主計總處「工業及服務業受僱員工全年總薪資中位數及分布統計」, published each year around late November.
// Update: add a YEARS row (表1, 表2) and replace the 113 tables below (表5, 表6, 表7).
// https://www.dgbas.gov.tw/News_Content.aspx?n=3602&s=235514

/** All amounts are in 萬元. */
export interface YearRow {
  year: number;
  roc: number;
  /** D1 to D9 from 表2. */
  d: readonly [number, number, number, number, number, number, number, number, number];
  q1: number;
  q3: number;
}

export interface Quartiles {
  q1: number;
  median: number;
  q3: number;
}

export interface Group extends Quartiles {
  name: string;
}

export const YEARS: readonly YearRow[] = [
  { year: 2014, roc: 103, d: [24.8, 29, 33.8, 39.6, 45.2, 52, 61.2, 75.6, 104.6], q1: 31.1, q3: 67.3 },
  { year: 2015, roc: 104, d: [25.1, 29.4, 34, 39.8, 46, 53, 62.6, 77.7, 108.4], q1: 31.4, q3: 69 },
  { year: 2016, roc: 105, d: [25.3, 29.7, 34.6, 40.2, 46.2, 53, 62.5, 78.3, 108.9], q1: 31.9, q3: 69.4 },
  { year: 2017, roc: 106, d: [26.1, 30.6, 35.3, 41.2, 47.2, 54.5, 64, 80.5, 112.3], q1: 32.8, q3: 71 },
  { year: 2018, roc: 107, d: [27.6, 32.1, 36.9, 42.7, 48.7, 55.7, 65.8, 82.6, 115.8], q1: 34.1, q3: 73.1 },
  { year: 2019, roc: 108, d: [28.7, 33.3, 38.1, 43.6, 49.4, 56.7, 66.7, 83.9, 118.3], q1: 35.4, q3: 74.3 },
  { year: 2020, roc: 109, d: [29.3, 34.1, 38.8, 44.2, 49.8, 57.1, 67.4, 84.8, 119.5], q1: 36, q3: 75 },
  { year: 2021, roc: 110, d: [29.6, 34.2, 39.6, 44.7, 50.8, 58.3, 69.4, 87.9, 123.5], q1: 36.7, q3: 77.5 },
  { year: 2022, roc: 111, d: [30.4, 35.2, 40.3, 45.4, 51.8, 59.4, 71.3, 90.6, 128.1], q1: 37.5, q3: 79.6 },
  { year: 2023, roc: 112, d: [31.6, 36.8, 41.3, 46.5, 52.5, 60.1, 72, 91.7, 127.9], q1: 38.8, q3: 80.5 },
  { year: 2024, roc: 113, d: [33, 38.1, 43.2, 48.7, 54.6, 62.8, 75.3, 95.9, 133.6], q1: 40.6, q3: 84.2 },
];

export const LATEST = YEARS[YEARS.length - 1];
export const MEAN = 73.2;
export const BELOW_MEAN_SHARE = 68.75;

/** 表6: Taiwanese full-time employees. */
export const FULL_TIME: Group = { name: '本國籍全時員工', q1: 43.6, median: 58.5, q3: 90.7 };

// 表5: all employees.
export const GENDERS: readonly Group[] = [
  { name: '男性', q1: 42.6, median: 58.5, q3: 93.5 },
  { name: '女性', q1: 39, median: 51.2, q3: 74.3 },
];

export const AGES: readonly Group[] = [
  { name: '未滿 25 歲', q1: 30.2, median: 38.1, q3: 49.1 },
  { name: '25–29 歲', q1: 40.3, median: 52.1, q3: 70.7 },
  { name: '30–39 歲', q1: 43, median: 58.1, q3: 86.2 },
  { name: '40–49 歲', q1: 44, median: 62, q3: 99.5 },
  { name: '50–64 歲', q1: 42.3, median: 57.9, q3: 98.3 },
  { name: '65 歲以上', q1: 33.9, median: 43.9, q3: 62.7 },
];

export const EDUCATIONS: readonly Group[] = [
  { name: '國中及以下', q1: 36, median: 43.9, q3: 55.5 },
  { name: '高中職', q1: 37.9, median: 48.1, q3: 63.5 },
  { name: '專科及大學', q1: 42.2, median: 58.2, q3: 88.7 },
  { name: '研究所', q1: 66.2, median: 109.9, q3: 159.5 },
];

export const FIRM_SIZES: readonly Group[] = [
  { name: '4 人以下公司', q1: 34.1, median: 39.5, q3: 51.1 },
  { name: '5–99 人公司', q1: 38.2, median: 47.8, q3: 64.2 },
  { name: '100–299 人公司', q1: 46.3, median: 59.1, q3: 86.5 },
  { name: '300–499 人公司', q1: 48.5, median: 63.6, q3: 93.4 },
  { name: '500 人以上公司', q1: 54.3, median: 80.2, q3: 124.7 },
];

export const INDUSTRIES: readonly { label: string; groups: readonly Group[] }[] = [
  {
    label: '服務業',
    groups: [
      { name: '批發業', q1: 40.2, median: 52.3, q3: 77 },
      { name: '零售業', q1: 38.2, median: 48.5, q3: 66 },
      { name: '運輸及倉儲業', q1: 47.2, median: 68.2, q3: 96.6 },
      { name: '住宿及餐飲業', q1: 33, median: 41.5, q3: 55.4 },
      { name: '出版影音及資通訊業', q1: 57.3, median: 80.7, q3: 125.6 },
      { name: '金融及保險業', q1: 72, median: 110.6, q3: 155.8 },
      { name: '不動產業', q1: 38.7, median: 53.7, q3: 80.4 },
      { name: '專業科學及技術服務業', q1: 44, median: 65.4, q3: 99.5 },
      { name: '支援服務業', q1: 35.9, median: 45.5, q3: 53.6 },
      { name: '教育業（不含小學以上學校）', q1: 33, median: 38.2, q3: 47.9 },
      { name: '醫療保健及社會工作服務業', q1: 46, median: 63.3, q3: 96.3 },
      { name: '藝術娛樂及休閒服務業', q1: 33, median: 41.1, q3: 60.1 },
      { name: '其他服務業', q1: 33, median: 38.1, q3: 53.6 },
    ],
  },
  {
    label: '製造業',
    groups: [
      { name: '食品及飼品製造業', q1: 41.5, median: 49.6, q3: 63.4 },
      { name: '飲料及菸草製造業', q1: 48.1, median: 65.4, q3: 98 },
      { name: '紡織業', q1: 40, median: 46.6, q3: 58.5 },
      { name: '成衣及服飾品製造業', q1: 34.1, median: 41.4, q3: 55.8 },
      { name: '皮革毛皮及其製品製造業', q1: 38.9, median: 47.9, q3: 69.3 },
      { name: '木竹製品製造業', q1: 39.9, median: 45, q3: 53.8 },
      { name: '紙漿紙及紙製品製造業', q1: 38.3, median: 45.4, q3: 60.4 },
      { name: '印刷及資料儲存媒體複製業', q1: 38.1, median: 44.9, q3: 56.4 },
      { name: '石油及煤製品製造業', q1: 88.1, median: 116.8, q3: 133.9 },
      { name: '化學材料及肥料製造業', q1: 61.1, median: 86.8, q3: 117.6 },
      { name: '其他化學製品製造業', q1: 47.5, median: 61.5, q3: 87.2 },
      { name: '藥品及醫用化學製品製造業', q1: 46.2, median: 57.8, q3: 81.2 },
      { name: '橡膠製品製造業', q1: 40.5, median: 47, q3: 59.1 },
      { name: '塑膠製品製造業', q1: 40.7, median: 48.1, q3: 62.2 },
      { name: '非金屬礦物製品製造業', q1: 42.3, median: 53.2, q3: 71 },
      { name: '基本金屬製造業', q1: 48.1, median: 61.5, q3: 88 },
      { name: '金屬製品製造業', q1: 38.6, median: 45.2, q3: 56 },
      { name: '電子零組件製造業', q1: 63.8, median: 87.6, q3: 140.3 },
      { name: '電腦電子產品及光學製品製造業', q1: 58.4, median: 89.9, q3: 140.8 },
      { name: '電力設備及配備製造業', q1: 40.3, median: 51.8, q3: 78.8 },
      { name: '機械設備製造業', q1: 39.4, median: 48.5, q3: 66.3 },
      { name: '汽車及其零件製造業', q1: 44.6, median: 51.7, q3: 70.2 },
      { name: '其他運輸工具及其零件製造業', q1: 44.9, median: 54.2, q3: 75.3 },
      { name: '家具製造業', q1: 35.4, median: 41, q3: 47.7 },
      { name: '其他製造業', q1: 42, median: 49.2, q3: 64 },
      { name: '產業用機械設備維修及安裝業', q1: 46.4, median: 63.6, q3: 118 },
    ],
  },
  {
    label: '其他工業',
    groups: [
      { name: '礦業及土石採取業', q1: 40.6, median: 68.2, q3: 107.4 },
      { name: '電力及燃氣供應業', q1: 82, median: 109.1, q3: 139.8 },
      { name: '用水供應及污染整治業', q1: 36.6, median: 50.5, q3: 67.8 },
      { name: '營建工程業', q1: 36.3, median: 49.7, q3: 74.7 },
    ],
  },
];

/** 表7: medians for Taiwanese full-time employees by workplace county. */
export const COUNTIES: readonly { name: string; median: number }[] = [
  { name: '臺北市', median: 73.5 },
  { name: '新北市', median: 55.7 },
  { name: '基隆市', median: 55.3 },
  { name: '桃園市', median: 61.6 },
  { name: '新竹市', median: 90.2 },
  { name: '新竹縣', median: 73.6 },
  { name: '苗栗縣', median: 59.1 },
  { name: '臺中市', median: 51.7 },
  { name: '彰化縣', median: 46.8 },
  { name: '南投縣', median: 49.9 },
  { name: '雲林縣', median: 53.3 },
  { name: '嘉義市', median: 49.1 },
  { name: '嘉義縣', median: 50.2 },
  { name: '臺南市', median: 53.8 },
  { name: '高雄市', median: 54.2 },
  { name: '屏東縣', median: 47.9 },
  { name: '宜蘭縣', median: 51 },
  { name: '花蓮縣', median: 50.4 },
  { name: '臺東縣', median: 48.3 },
  { name: '澎湖縣', median: 48.9 },
];
