/** @jsx React.DOM */
(function() {

var MATHQUILL = "mathquill";
var RAW = "raw";

var DISPLAY_NAMES = {};
DISPLAY_NAMES[MATHQUILL] = "MathQuill";
DISPLAY_NAMES[RAW] = "Raw";

// we want to augment the json for an expr with the name of the node.
var nodeJSONString = function(expr) {
    return JSON.stringify(addNodeTypeField(expr), null, 2);
};

var addNodeTypeField = function(expr) {
    var json = _.extend(_.clone(expr));
    json.nodeType = expr.name();
    if (json.terms) {
        json.terms = _.map(json.terms, addNodeTypeField);
    }
    return json;
};

var MathQuillInput = React.createClass({
    getDefaultProps: function() {
        return {
            latex: ""
        };
    },

    render: function() {
        return <div className="math-input" />;
    },

    componentDidMount: function(node) {
        var $node = $(node);
        var self = this;
        $node.html(this.props.latex)
             .mathquill("editable")
             .on("input keydown", function() {
                 self.props.onChange({target: {value: $node.mathquill("latex")}});
             });
    }
});

var InputField = React.createClass({
    getDefaultProps: function() {
        return {
            type: MATHQUILL,
            value: ""
        };
    },

    propTypes: {
        type: React.PropTypes.oneOf([MATHQUILL, RAW])
    },

    render: function() {
        if (this.props.type === MATHQUILL) {
            return <MathQuillInput
                latex={this.props.value}
                onChange={this.props.onChange} />;
        } else {
            return <input
                className="math-input"
                type="text"
                defaultValue={this.props.value}
                onChange={this.props.onChange} />;
        }
    }
});

var InfoElement = React.createClass({
    getDefaultProps: function() {
        return {
            description: "",
            value: "",
            valueClass: ""
        };
    },

    render: function() {
        return <div className="info-element">
            <div className="description">
                {this.props.description}:&nbsp;
            </div>
            <div className={"value " + this.props.valueClass}>
                {this.props.value}
            </div>
        </div>;
    }
});

var InfoPane = React.createClass({
    getDefaultProps: function() {
        return {
            latex: "",
            error: false
        };
    },

    render: function() {
        if (this.props.expr === undefined) {
            return <div />;
        }
        return <div className={"info " + (this.props.error ?  "error" : "")}>
            <InfoElement
                description="Provided TeX"
                value={this.props.latex} />
            <InfoElement
                description="AST Representation"
                value={this.props.expr.repr()} />
            <InfoElement
                description="Printed Representation"
                value={this.props.expr.normalize().print()} />
            <InfoElement
                description="Simplified?"
                value={this.props.expr.isSimplified() ?  "Yes" : "No"} />
            <InfoElement
                description="Simplified"
                value={this.props.expr.simplify().normalize().print()} />
            <InfoElement
                description="JSON"
                valueClass="code"
                value={<pre>
                        {nodeJSONString(this.props.expr)}
                       </pre>} />
        </div>;
    }
});

var Experimenter = React.createClass({
    getInitialState: function () {
        return {
            inputtedLatex: "",
            validLatex: "",
            inputMethod: MATHQUILL
        };
    },

    render: function() {
        var self = this;
        return <div>
            <InputField
                value={this.state.inputtedLatex}
                type={this.state.inputMethod}
                onChange={this.handleInput} />
                <div className="input-toggle" >
                    {_.map([MATHQUILL, RAW], function(type) {
                        return <label key={type}>
                            {" "}
                            <input type="radio"
                                name="input-type"
                                value={type}
                                onChange={self.handleChangeInputMethod}
                                checked={self.state.inputMethod === type} />
                            {" "}{DISPLAY_NAMES[type]}
                        </label>;
                    })}
                </div>
            <InfoPane
                expr={this.state.expr}
                latex={this.state.validLatex}
                error={this.state.error} />
        </div>;
    },

    handleChangeInputMethod: function(e) {
        this.setState({inputMethod: e.target.value});
    },

    handleInput: function(e) {
        var newLatex = e.target.value;
        var expression = KAS.parse(newLatex, {});
        if (expression.parsed && newLatex !== "") {
            this.setState({
                expr: expression.expr,
                inputtedLatex: newLatex,
                validLatex: newLatex,
                error: false
            });
        } else {
            this.setState({
                inputtedLatex: newLatex,
                error: true
            });
        }
    }
});

React.renderComponent(<Experimenter />, document.body);
})();
