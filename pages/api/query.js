// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from '@/lib/planetscale';

export default async (req, res) => {
  const {
    body: { firstname, lastname, city, country },
    method
  } = req
  switch (method) {
    case 'POST':
      const [rows, fields] = await db.query(
        `insert into customers (firstname, lastname, city, country) values ('${firstname}', '${lastname}', '${city}', '${country}')`
      )
      res.statusCode = 201
      res.json({ firstname, lastname, city, country })
      break
    case 'GET':
      try {
        const [getRows, _] = await db.query('select * from customers')
        res.statusCode = 200
        res.json(getRows)
      } catch (e) {
        error = new Error('An error occurred while connecting to the database')
        error.status = 500
        error.info = { message: 'An error occurred while connecting to the database' }
        throw error
      }

      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}