export const osanaProducts = [
  ['osana-1','Filezinho sassami congelado IQF','Agrosul','700 g',14.99,'Carnes',1,[70,500,455,300],12.99],
  ['osana-2','Contra filé bovino a vácuo','','kg',54.90,'Carnes',1,[565,500,455,300],46.90],
  ['osana-3','Coxa e sobrecoxa de frango congelada','','kg',6.99,'Carnes',1,[70,800,455,300],5.99],
  ['osana-4','Coxinha da asa congelada IQF','Agrosul','800 g',10.99,'Carnes',1,[565,800,455,300],8.99]
].map(([id,name,brand,size,price,category,page,region,clubPrice]) => ({
  id,
  name,
  brand,
  size,
  price,
  category,
  clubPrice,
  bulk:null,
  page,
  region,
  market:'Supermercados Osana',
  storeId:'super-osana',
  neighborhoods:['Guarani','Ideal','Roselândia','Via Rosa'],
  validFrom:'2026-06-06',
  validUntil:'2026-06-06',
  image:'/superosana.png',
  sourceWidth:1131
}))
