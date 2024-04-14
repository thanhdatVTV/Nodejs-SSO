
const getHomepage = (req, res) => {
    //Process DATA => call Model
    return res.render('home.ejs')
}

const getABC = (req, res) => {
    res.send('getabc');
}

module.exports = {
    getHomepage, getABC
}
