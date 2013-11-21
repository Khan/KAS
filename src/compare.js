(function(KAS) {

// assumes that both expressions have already been parsed
// TODO(alex): be able to pass a random() function to compare()
KAS.compare = function(expr1, expr2, options) {
    var defaults = {
        form: false,        // check that the two expressions have the same form
        simplify: false     // check that the second expression is simplified
    };

    /* more possible options:
        allow ratios e.g. 3/1 and 3 should both be accepted for something like slope
        allow student to choose their own variables names
    */

    if (options !== undefined) {
        options = _.extend(defaults, options);
    } else {
        options = defaults;
    }

    var xUsedAsMultOp = function() {
        var vars = expr1.getVars() + expr2.getVars();
        if (!_.contains(vars.toLowerCase(),"x"))
            return false;
        var replace = function(expr) {
            var replacedStr = expr.print().replace(/.x./gi,"*");
            return KAS.parse(replacedStr, options);
        };
        var testPairs = [[replace(expr1),expr2], [replace(expr2),expr1]];
        return _.some(testPairs, function(pair) {
            var x =  pair[0].parsed && pair[0].expr.compare(pair[1]);
            return pair[0].parsed && pair[0].expr.compare(pair[1]);
        });
    };

    // variable check
    var vars = expr1.sameVars(expr2);
    if (!vars.equal) {
        var message = null;
        if (vars.equalIgnoringCase) {
            message = "Some of your variables are in the wrong case (upper vs. lower).";
        }
        else if (xUsedAsMultOp()) {
            message = "Use *, not x, for multiplication.";
        }
        return {equal: false, message: message};
    }

    // semantic check
    if (!expr1.compare(expr2)) {
        message = null;
        if (xUsedAsMultOp()) {
            message = "Use *, not x, for multiplication.";
        }
        return {equal: false, message: message};
    }

    // syntactic check
    if (options.form && !expr1.sameForm(expr2)) {
        return {equal: false, message: "Your answer is not in the correct form."};
    }

    // syntactic check
    if (options.simplify && !expr1.isSimplified()) {
        return {equal: false, message: "Your answer is not fully expanded and simplified."};
    }

    return {equal: true, message: null};
};

})(KAS);
