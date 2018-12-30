const express = require('express')
const subsRouter = express.Router()

const {
	authorizationMiddleware
} = require('../../managers/token/TokenManager')

const {
	getPlanByName
} = require('../../managers/subs/SubsManager')

const PLAN_GET = require('../../__runtime_tests__/stub_endpoint/subs/plan_GET')
const PLAN_POST = require('../../__runtime_tests__/stub_endpoint/subs/plan_POST')

const {
	isTestEnabled
} = require('../../utils/testUtils')

subsRouter.use(authorizationMiddleware('company'))

subsRouter.get('/plan', async (req, res, next) => {

	if(!req.query.plan) {
		let err = new Error("Bad request")
		err.status = 400
		next(err)
	}

	const response = await getPlanByName(req.query.plan)
	res
	.status(200)
	.send(response)
})

subsRouter.post('/plan', (req, res, next) => {
	const action = isTestEnabled(req)
	if (action) {
		res
		.status(PLAN_POST[action].status)
		.send(PLAN_POST[action])
		return
	}
	// TODO: Implement
})

module.exports = subsRouter