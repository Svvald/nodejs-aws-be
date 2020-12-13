import { SQSHandler } from 'aws-lambda';
import { SNS } from 'aws-sdk';
import { Client } from 'pg';
import format from 'pg-format';
import { DEFAULT_REGION } from '../../utils/configs';
import { DB_OPTIONS } from '../../utils/db-options';

export const catalogBatchProcess: SQSHandler = async (event) => {
  console.log('catalogBatchProcess invokation with event: ', event);

  const client = new Client(DB_OPTIONS);
  await client.connect();

  try {
    const payload = event.Records.map(record => JSON.parse(record.body));

    const products = payload.map(({ title, description, price }) => ([title, description, price ]));
    const insertProductsQuery = format(`insert into products(title, description, price) values %L returning id`, products);

    await client.query(`begin`);

    const productsInsertResult = await client.query(insertProductsQuery);

    const stocks = payload.map((product, index) => ([productsInsertResult.rows[index].id, product.count]));
    const insertStocksQuery = format(`insert into stocks(product_id, count) values %L`, stocks);

    await client.query(insertStocksQuery);

    await client.query(`commit`);

    console.log(`Created products: ${productsInsertResult.rows}`);

    const sns = new SNS({ region: DEFAULT_REGION });
    const message = payload.map((product, index) => `${index}. ${product.title}, ${product.price}$ (${product.count} pcs.)`).join('\n');

    await sns.publish({
      Subject: 'New products have been added',
      Message: message,
      TopicArn: process.env.SNS_TOPIC_ARN
    }).promise();

    console.log('An email notification has been sent');
  } catch (error) {
    await client.query(`rollback`);

    console.log('An error occured while processing event: ', error);
  } finally {
    await client.end();
  }
};
