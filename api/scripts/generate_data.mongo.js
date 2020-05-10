/* global db print */
/* eslint no-restricted-globals: "off" */
db.products.remove({});
db.deleted_products.remove({});
db.counters.remove({});
const Categories = ['Shirts', 'Jeans', 'Jackets', 'Sweaters', 'Accessories'];
const Names = ['Zara', 'H&M'];
const Images = ['https://i.pinimg.com/originals/8d/fb/38/8dfb3860ee73183250ecb72da66984c4.jpg', 'https://i.pinimg.com/originals/9e/75/0c/9e750c88236899ea2f28bcab5bb4267e.jpg'] ;
const incount = db.products.count();
for (let i = 0; i < 25; i += 1) {
  const id = incount + i + 1;
  const category = Categories[Math.floor(Math.random() * 5)];
  const name = Names[Math.floor(Math.random() * 2)];
  const price = Math.ceil(Math.random() * 500);
  const image = Images[Math.floor(Math.random() * 2)];
  const product = {
    id, category, name, price, image, 
  };
  db.products.insertOne(product);
}
const it = db.products.count();
db.counters.insert({ _id: 'products', current: it });
print('New product count:', it);
