function init() {
    let $ = go.GraphObject.make;  // for conciseness in defining templates

    myDiagram =
        $(go.Diagram, "family-data-diagram", // must be the ID or reference to div
            {
                initialContentAlignment: go.Spot.Center,
                maxSelectionCount: 1, // users can select only one part at a time
                validCycle: go.Diagram.CycleDestinationTree, // make sure users can only create trees
                "clickCreatingTool.archetypeNodeData": {}, // allow double-click in background to create a new node
                "clickCreatingTool.insertPart": function(loc) {  // customize the data for the new node
                    this.archetypeNodeData = {
                        key: getNextKey(), // assign the key based on the number of nodes
                        name: "(new person)",
                        title: ""
                    };
                    return go.ClickCreatingTool.prototype.insertPart.call(this, loc);
                },
                layout:
                    $(go.TreeLayout,
                        {
                            treeStyle: go.TreeLayout.StyleLastParents,
                            arrangement: go.TreeLayout.ArrangementHorizontal,
                            // properties for most of the tree:
                            angle: 90,
                            layerSpacing: 35,
                            // properties for the "last parents":
                            alternateAngle: 90,
                            alternateLayerSpacing: 35,
                            alternateAlignment: go.TreeLayout.AlignmentBus,
                            alternateNodeSpacing: 20
                        }),
                "undoManager.isEnabled": true // enable undo & redo
            });

    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener("Modified", function(e) {
        let button = document.getElementById("SaveButton");
        if (button) button.disabled = !myDiagram.isModified;
        let idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
            if (idx < 0) document.title += "*";
        } else {
            if (idx >= 0) document.title = document.title.substr(0, idx);
        }
    });

    // manage boss info manually when a node or link is deleted from the diagram
    myDiagram.addDiagramListener("SelectionDeleting", function(e) {
        let part = e.subject.first(); // e.subject is the myDiagram.selection collection,
                                      // so we'll get the first since we know we only have one selection
        myDiagram.startTransaction("clear boss");
        if (part instanceof go.Node) {
            let it = part.findTreeChildrenNodes(); // find all child nodes
            while(it.next()) { // now iterate through them and clear out the boss information
                let child = it.value;
                let bossText = child.findObject("boss"); // since the boss TextBlock is named, we can access it by name
                if (bossText === null) return;
                bossText.text = "";
            }
        } else if (part instanceof go.Link) {
            let child = part.toNode;
            let bossText = child.findObject("boss"); // since the boss TextBlock is named, we can access it by name
            if (bossText === null) return;
            bossText.text = "";
        }
        myDiagram.commitTransaction("clear boss");
    });

    let levelColors = ["#AC193D", "#2672EC", "#8C0095", "#5133AB",
        "#008299", "#D24726", "#008A00", "#094AB2"];

    // override TreeLayout.commitNodes to also modify the background brush based on the tree depth level
    myDiagram.layout.commitNodes = function() {
        go.TreeLayout.prototype.commitNodes.call(myDiagram.layout);  // do the standard behavior
        // then go through all of the vertexes and set their corresponding node's Shape.fill
        // to a brush dependent on the TreeVertex.level value
        myDiagram.layout.network.vertexes.each(function(v) {
            if (v.node) {
                let level = v.level % (levelColors.length);
                let color = levelColors[level];
                let shape = v.node.findObject("SHAPE");
                if (shape) shape.fill = $(go.Brush, "Linear", { 0: color, 1: go.Brush.lightenBy(color, 0.05), start: go.Spot.Left, end: go.Spot.Right });
            }
        });
    };

    // This function is used to find a suitable ID when modifying/creating nodes.
    // We used the counter combined with findNodeDataForKey to ensure uniqueness.
    function getNextKey() {
        let key = nodeIdCounter;
        while (myDiagram.model.findNodeDataForKey(key) !== null) {
            key = nodeIdCounter--;
        }
        return key;
    }

    let nodeIdCounter = -1; // use a sequence to guarantee key uniqueness as we add/remove/modify nodes

    // when a node is double-clicked, add a child to it
    function nodeDoubleClick(e, obj) {
        let clicked = obj.part;
        if (clicked !== null) {
            let thisemp = clicked.data;
            myDiagram.startTransaction("add employee");
            let newemp = { key: getNextKey(), name: "(new person)", title: "", parent: thisemp.key };
            myDiagram.model.addNodeData(newemp);
            myDiagram.commitTransaction("add employee");
        }
    }

    // this is used to determine feedback during drags
    function mayWorkFor(node1, node2) {
        if (!(node1 instanceof go.Node)) return false;  // must be a Node
        if (node1 === node2) return false;  // cannot work for yourself
        if (node2.isInTreeOf(node1)) return false;  // cannot work for someone who works for you
        return true;
    }

    // This function provides a common style for most of the TextBlocks.
    // Some of these values may be overridden in a particular TextBlock.
    function textStyle() {
        return { font: "9pt  Segoe UI,sans-serif", stroke: "white" };
    }

    // get tooltip text from the object's data
    function tooltipTextConverter(person) {
        let str = "";
        str += "Born: " + person.birthYear;
        if (person.deathYear !== undefined) str += "\nDied: " + person.deathYear;
        if (person.reign !== undefined) str += "\nReign: " + person.reign;
        return str;
    }

    // define tooltips for nodes
    let tooltiptemplate =
        $(go.Adornment, "Auto",
            $(go.Shape, "Rectangle",
                { fill: "whitesmoke", stroke: "black" }),
            $(go.TextBlock,
                { font: "bold 8pt Helvetica, bold Arial, sans-serif",
                    wrap: go.TextBlock.WrapFit,
                    margin: 5 },
                new go.Binding("text", "", tooltipTextConverter))
        );

    // define the Node template
    myDiagram.nodeTemplate =
        $(go.Node, "Auto",
            { deletable: false, toolTip: tooltiptemplate },
            { doubleClick: nodeDoubleClick },
            { // handle dragging a Node onto a Node to (maybe) change the reporting relationship
                mouseDragEnter: function (e, node, prev) {
                    let diagram = node.diagram;
                    let selnode = diagram.selection.first();
                    if (!mayWorkFor(selnode, node)) return;
                    let shape = node.findObject("SHAPE");
                    if (shape) {
                        shape._prevFill = shape.fill;  // remember the original brush
                        shape.fill = "darkred";
                    }
                },
                mouseDragLeave: function (e, node, next) {
                    let shape = node.findObject("SHAPE");
                    if (shape && shape._prevFill) {
                        shape.fill = shape._prevFill;  // restore the original brush
                    }
                },
                mouseDrop: function (e, node) {
                    let diagram = node.diagram;
                    let selnode = diagram.selection.first();  // assume just one Node in selection
                    if (mayWorkFor(selnode, node)) {
                        // find any existing link into the selected node
                        let link = selnode.findTreeParentLink();
                        if (link !== null) {  // reconnect any existing link
                            link.fromNode = node;
                        } else {  // else create a new link
                            diagram.toolManager.linkingTool.insertLink(node, node.port, selnode, selnode.port);
                        }
                    }
                }
            },
            // for sorting, have the Node.text be the data.name
            new go.Binding("text", "name"),
            // bind the Part.layerName to control the Node's layer depending on whether it isSelected
            new go.Binding("layerName", "isSelected", function(sel) { return sel ? "Foreground" : ""; }).ofObject(),
            // define the node's outer shape
            $(go.Shape, "Rectangle",
                {
                    name: "SHAPE", fill: "white", stroke: null,
                    // set the port properties:
                    portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"
                }),
            $(go.Panel, "Horizontal",
                // define the panel where the text will appear
                $(go.Panel, "Table",
                    {
                        maxSize: new go.Size(150, 999),
                        margin: new go.Margin(6, 10, 0, 3),
                        defaultAlignment: go.Spot.Left
                    },
                    $(go.RowColumnDefinition, { column: 2, width: 4 }),
                    $(go.TextBlock, textStyle(),  // the name
                        {
                            row: 0, column: 0, columnSpan: 5,
                            font: "12pt Segoe UI,sans-serif",
                            editable: true, isMultiline: false,
                            minSize: new go.Size(10, 16)
                        },
                        new go.Binding("text", "name").makeTwoWay()),
                    $(go.TextBlock, "Gender: ", textStyle(),
                        { row: 1, column: 0 }),
                    $(go.TextBlock, textStyle(),
                        {
                            row: 1, column: 1, columnSpan: 4,
                            editable: true, isMultiline: false,
                            minSize: new go.Size(10, 14),
                            margin: new go.Margin(0, 0, 0, 3)
                        },
                        new go.Binding("text", "gender").makeTwoWay()),
                    $(go.TextBlock, textStyle(),
                        { row: 2, column: 0 },
                        new go.Binding("text", "key", function(v) {return "ID: " + v;})),
                    $(go.TextBlock, textStyle(),
                        { name: "boss", row: 2, column: 3, }, // we include a name so we can access this TextBlock when deleting Nodes/Links
                        new go.Binding("text", "parent", function(v) {return "Parent: " + v;})),
                    $(go.TextBlock, textStyle(),  // the comments
                        {
                            row: 3, column: 0, columnSpan: 5,
                            font: "italic 9pt sans-serif",
                            wrap: go.TextBlock.WrapFit,
                            editable: true,  // by default newlines are allowed
                            minSize: new go.Size(10, 14)
                        },
                        new go.Binding("text", "comments").makeTwoWay())
                )  // end Table Panel
            ) // end Horizontal Panel
        );  // end Node

    // the context menu allows users to
    // remove a person and reassign the subtree, or remove whole lineage
    myDiagram.nodeTemplate.contextMenu =
        $(go.Adornment, "Vertical",
            $("ContextMenuButton",
                $(go.TextBlock, "Remove Person"),
                {
                    click: function(e, obj) {
                        // reparent the subtree to this node's boss, then remove the node
                        let node = obj.part.adornedPart;
                        if (node !== null) {
                            myDiagram.startTransaction("reparent remove");
                            let chl = node.findTreeChildrenNodes();
                            // iterate through the children and set their parent key to our selected node's parent key
                            while(chl.next()) {
                                let emp = chl.value;
                                myDiagram.model.setParentKeyForNodeData(emp.data, node.findTreeParentNode().data.key);
                            }
                            // and now remove the selected node itself
                            myDiagram.model.removeNodeData(node.data);
                            myDiagram.commitTransaction("reparent remove");
                        }
                    }
                }
            ),
            $("ContextMenuButton",
                $(go.TextBlock, "Remove whole lineage"),
                {
                    click: function(e, obj) {
                        // remove the whole subtree, including the node itself
                        let node = obj.part.adornedPart;
                        if (node !== null) {
                            myDiagram.startTransaction("remove dept");
                            myDiagram.removeParts(node.findTreeParts());
                            myDiagram.commitTransaction("remove dept");
                        }
                    }
                }
            )
        );

    // define the Link template
    myDiagram.linkTemplate =
        $(go.Link, go.Link.Orthogonal,
            { corner: 5, relinkableFrom: true, relinkableTo: true },
            $(go.Shape, { strokeWidth: 4, stroke: "#00a4a4" }));  // the link shape

    // read in the JSON-format data from the backend api
    getFamilyData();


    // support editing the properties of the selected person in HTML
    if (window.Inspector) myInspector = new Inspector("dataInspector", myDiagram,
        {
            properties: {
                "key": { readOnly: true },
                "comments": {}
            }
        });
}

function getFamilyData() {
    $.ajax({
        url: "http://localhost:3000/api/people",
        dataType: "json",
        success(data) {
            myDiagram.model = go.Model.fromJson(data);
        }
    });
}

function updateFamilyData() {
    let data = myDiagram.model.toJson();
    myDiagram.isModified = false;
    $.ajax({
        url: "http://localhost:3000/api/people",
        method: "PUT",
        data: data,
        contentType : "application/json",
        success() {
            getFamilyData();         // get the updated data back and rebuild the graph
        }
    });
}

$(document).ready(function () {
    getFamilyData();
    init();
});