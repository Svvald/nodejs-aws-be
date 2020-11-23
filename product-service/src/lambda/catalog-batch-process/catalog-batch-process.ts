import { SQSHandler } from 'aws-lambda';
import { Client } from 'pg';
import format from 'pg-format';
import { DB_OPTIONS } from '../../utils/db-options';

export const catalogBatchProcess: SQSHandler = async (event) => {
  console.log('catalogBatchProcess invokation with event: ', event);

  const client = new Client(DB_OPTIONS);
  await client.connect();

  try {
    const payload = event.Records.map(record => JSON.parse(record.body));

    const products = payload.map(({ title, description, price }) => ([title, description, price ]));
    const insertProductsQuery = format(`insert into products(title, description, price) values %L returning id`, products);
    console.warn(insertProductsQuery);

    await client.query(`begin`);

    const productsInsertResult = await client.query(insertProductsQuery);

    console.warn(productsInsertResult);

    const stocks = payload.map((product, index) => ([productsInsertResult.rows[index].id, product.count]));
    const insertStocksQuery = format(`insert into stocks(product_id, count) values %L`, stocks);
    console.warn(insertStocksQuery);

    await client.query(insertStocksQuery);

    await client.query(`commit`);

    console.log(`Created products: ${productsInsertResult.rows}`);
  } catch (error) {
    await client.query(`rollback`);

    console.log('An error occured while processing event: ', error);
  } finally {
    await client.end();
  }
};
