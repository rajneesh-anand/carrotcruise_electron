const pool = require("../config/database");
const db = require("./sqliteConfig");

module.exports = {
  create: (data, callBack) => {
    console.log(data);
    db.run(
      `insert into customers(Prefix,first_name, last_name,address_line_one, address_line_two,city,state,pincode,mobile,phone,gstin,email,pan) 
                values(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.prefix,
        data.first_name,
        data.last_name,
        data.address_line_one,
        data.address_line_two,
        data.city,
        data.state,
        data.pincode,
        data.mobile,
        data.phone,
        data.gstin,
        data.email,
        data.pan,
      ],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getUserByUserEmail: (email, callBack) => {
    pool.query(
      `select * from registration where email = ?`,
      [email],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  fetchCustomerById: (id, callBack) => {
    console.log(id);
    db.get(`select * from customers where id = ?`, [id], (error, results) => {
      console.log(results);
      if (error) {
        callBack(error);
      }
      return callBack(null, results);
    });
  },
  fetchCustomers: (callBack) => {
    pool.query(
      `SELECT concat(c.Prefix,c.id) as id,c.first_name,c.last_name,c.address_line_one,c.address_line_two,c.city,c.pincode,c.mobile,c.email,c.phone,c.gstin,s.State_Name FROM customers c, states s where c.state =s.id`,
      [],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  setCustomer: (data, callBack) => {
    console.log(data);
    db.run(
      `update customers set first_name=?, last_name=?, address_line_one=?, email=?, address_line_two=?, mobile=?, phone=?, state=?, gstin=?, city=?, pan=? where id = ?`,
      [
        data.first_name,
        data.last_name,
        data.address_line_one,
        data.email,
        data.address_line_two,
        data.mobile,
        data.phone,
        data.state,
        data.gstin,
        data.city,
        data.pan,
        data.id,
      ],
      (error, results) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
};
