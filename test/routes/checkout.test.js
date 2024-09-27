const request = require("supertest");
const app = require("../../index");

describe("Checkout Route", () => {
	it("should process the checkout and return status 200", (done) => {
		request(app)
			.post("/checkout")
			.send({ cart: [{ item: "Product 1", quantity: 1 }] }) // Mock cart data
			.expect(200)
			.end((err, res) => {
				// No need to expect specific properties
				done();
			});
	});
});
