exports.toTitleCase = function(str) {
    if (str == null) {
        return str;
    } else {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
};
