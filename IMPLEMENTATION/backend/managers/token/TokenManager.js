const jwt = require('jsonwebtoken')
const {
	Pool
} = require('pg')


function getActor(authToken) {
	try {
		return jwt.decode(authToken, process.env.JWT_SECRET)

	} catch (err) {
		err.message = 'Token is invalid'
		err.status = 401
		throw err
	}
}

// id: rows[0].id,
// email: rows[0].email,
// begin_time: new Date()

async function generateToken(id, email, begin_time) {

	const client = await new Pool({
		connectionString: process.env.DATABASE_URL + '?ssl=true',
		max: 5
	}).connect()
	const token = jwt.sign({
		id, email, begin_time
	}, process.env.JWT_SECRET, {
		expiresIn: 86400 // By default expire in 24h
	})
	await client.query('INSERT INTO user_token(user_id, value, expiry_date) VALUES($1, $2, $3)', [id, token, new Date(begin_time.getTime() + 60 * 60 * 24 * 1000)])
}

async function isActor(authToken, actor) {
	const client = await new Pool({
		connectionString: process.env.DATABASE_URL + '?ssl=true',
		max: 5
	}).connect()
	try {
		let decodedActor = jwt.decode(authToken, process.env.JWT_SECRET)
		const {
			rows
		} = await client.query(`SELECT * FROM ${actor}_account WHERE id = $1`, [decodedActor.id])
		return rows.length >= 1
	} catch (err) {
		console.log(err)
		err.message = 'Token is invalid'
		err.status = 400
		throw err
	}

}

function authorizationMiddleware(actor){
	return async (req, res, next) => {
		const token = req.body.auth_token || req.query.auth_token
		if(token && await isActor(token, actor)){
			next()
		} else {
			let err = new Error('Unauthorized')
			err.status = 401
			next(err)
		}
	}
}

module.exports = {
	generateToken,
	getActor,
	authorizationMiddleware
}