const { connect } = require("mongoose");
const colors = require("colors");

/** @param {string} mongoURI */
module.exports = async function (mongoURI) {
  connect(
    mongoURI,
    {
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) throw err;
      else
        console.log(
          `${colors.brightGreen("[DATABASE]")}`.white +
            colors.white(" Successfully connected to the database!"),
        );
    },
  );
};
