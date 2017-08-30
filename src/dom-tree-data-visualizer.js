let DomTreeDataVisualizer = {
    init: function () {
        let $ = go.GraphObject.make;  // for conciseness in defining templates

        myDiagram.div = null;
        myDiagram =
            $(go.Diagram, "family-data-diagram",
                {
                    initialAutoScale: go.Diagram.UniformToFill,
                    // define the layout for the diagram
                    layout: $(go.TreeLayout, {nodeSpacing: 5, layerSpacing: 30})
                });

        // get tooltip text from the object's data
        function tooltipTextConverter(person) {
            let str = "";
            str += "Born: " + person.birthYear;
            person.gender === "M" ? str += "\nGender: Male" : str += "\nGender: Female";
            if (person.deathYear !== undefined) str += "\nDied: " + person.deathYear;
            if (person.reign !== undefined) str += "\nReign: " + person.reign;
            return str;
        }

        // define tooltips for nodes
        let tooltiptemplate =
            $(go.Adornment, "Auto",
                $(go.Shape, "Rectangle",
                    {fill: "whitesmoke", stroke: "black"}),
                $(go.TextBlock,
                    {
                        font: "bold 8pt Helvetica, bold Arial, sans-serif",
                        wrap: go.TextBlock.WrapFit,
                        margin: 5
                    },
                    new go.Binding("text", "", tooltipTextConverter))
            );

        // Define a simple node template consisting of text followed by an expand/collapse button
        myDiagram.nodeTemplate =
            $(go.Node, "Horizontal",
                {deletable: false, toolTip: tooltiptemplate},
                {selectionChanged: this.nodeSelectionChanged},  // this event handler is defined below
                $(go.Panel, "Auto",
                    $(go.Shape, {fill: "#1F4963", stroke: null}),
                    $(go.TextBlock,
                        {
                            font: "bold 13px Helvetica, bold Arial, sans-serif",
                            stroke: "white", margin: 3
                        },
                        new go.Binding("text", "name"))
                ),
                $("TreeExpanderButton",
                    {
                        width: 14,
                        "ButtonIcon.stroke": "white",
                        "ButtonBorder.fill": "blue",
                        "ButtonBorder.stroke": "transparent",
                        "_buttonFillOver": "red",
                        "_buttonStrokeOver": "red"
                    })
            );

        // Define a trivial link template with no arrowhead.
        myDiagram.linkTemplate =
            $(go.Link,
                {selectable: false},
                $(go.Shape));  // the link shape

        this.getDomTreeData();
    },

    // When a Node is selected, highlight the corresponding HTML element.
    nodeSelectionChanged: function (node) {
        if (node.isSelected) {
            node.style = "background-color: lightblue";
        } else {
            node.style = "";
        }
    },

    getDomTreeData: function () {
        $.ajax({
            url: "http://localhost:3000/api/people",
            dataType: "json",
            success(data) {
                myDiagram.model = go.Model.fromJson(data);
            }
        });
    }
};