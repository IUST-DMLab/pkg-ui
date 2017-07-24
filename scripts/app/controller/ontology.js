app
    .controller('OntologyController', function ($scope, RestService, $state, $cookieStore, $mdDialog, $location) {

    })

    .controller('OntologyTreeController', function ($scope, RestService, $state, ivhTreeviewMgr) {
        $scope.lang = 'FA';
        $scope.type = 'SIMPLE';
        // $scope.type = 'GRAPHICAL';

        $scope.expandAll = function () {
            ivhTreeviewMgr.expandRecursive($scope.items, $scope.items);
        };

        $scope.collapseAll = function () {
            ivhTreeviewMgr.collapseRecursive($scope.items, $scope.items);
        };

        // $scope.expandTo = function (level) {
        //     ivhTreeviewMgr.collapseRecursive($scope.items, $scope.items);
        // };

        $scope.switchView = function () {
            $scope.type = $scope.type === 'SIMPLE' ? 'GRAPHICAL' : 'SIMPLE';
        };


        $scope.load = function () {

            // RestService.ontology.classTree(undefined, 2)
            RestService.ontology.classTree()
                .then(function (response) {
                    let items = response.data;
                    $scope.items = items;

                    renderTree(items, $state);
                });

        };

        $scope.load();
    })

    .controller('OntologyClassController', function ($scope, RestService, $state, $stateParams, $rootScope, $mdDialog) {

        let classUrl = $stateParams.classUrl;

        $scope.load = function () {
            $rootScope.title = classUrl ? 'ویرایش کلاس' : 'ایجاد کلاس جدید';
            if (classUrl) {
                //console.log('edit class : ', classUrl);
                RestService.ontology.getClass(classUrl)
                    .then(function (response) {
                        let clazz = response.data;
                        $scope.clazz = response.data;
                        // if (clazz.subClassOf) {
                        //     RestService.ontology.getClass(clazz.subClassOf)
                        //         .then(function (response2) {
                        //             $scope.clazz = response.data;
                        //             $scope.parent = response2.data;
                        //         });
                        // }
                        // else {
                        //     $scope.clazz = response.data;
                        //     $scope.parent = undefined;
                        // }
                    });
            }
            else {
                //console.log('add new class');
                $scope.clazz = {
                    "disjointWith": [],
                    "equivalentClasses": [],
                    "properties": [],
                };
                $scope.addNew = true;
            }
        };

        $scope.saveClass = function (ev) {
            //console.log($scope.clazz);
            RestService.ontology.saveClass($scope.clazz)
                .then(function (status) {
                    if (status) {
                        $state.go('ontology.class', {classUrl: $scope.clazz.url});
                    }
                    else {
                        $mdDialog.show(
                            $mdDialog.alert()
                                .parent(angular.element(document.querySelector('body')))
                                .clickOutsideToClose(true)
                                .title('خطا')
                                .textContent('خطایی رخ داده است!')
                                .ariaLabel('ERROR')
                                .ok('خب')
                                .targetEvent(ev)
                        );
                    }
                });
        };

        $scope.cancel = function () {
            if ($scope.addNew)
                $state.go('ontology.tree');
            else
                $state.go('ontology.class', {classUrl: $scope.clazz.url});
        };

        $scope.removeProperty = function (property) {
            let pos = $scope.clazz.properties.indexOf(property);
            $scope.clazz.properties.splice(pos, 1);
        };

        $scope.newProperty = function (ev) {

            $mdDialog.show({
                controller: DialogController,
                // scope: $scope,
                // preserveScope: true,
                templateUrl: './templates/ontology/property-selector.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            }).then(function (data) {
                //console.log(data.property);
                $scope.clazz.properties.push(data.property);
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });

        };

        $scope.queryClasses = function (query) {
            //console.log('queryClasses : ', query);
            return RestService.ontology.queryClasses(query)
                .then(function (response) {
                    return response.data.data;
                });
        };

        $scope.load();


        function DialogController($scope, $mdDialog) {

            $scope.property = {};

            $scope.closeDialog = function () {
                $mdDialog.cancel();
            };

            $scope.queryProperties = function (query) {
                //console.log('queryProperties : ', query);
                return RestService.ontology.queryProperties(query)
                    .then(function (response) {
                        return response.data.data;
                    });
            };

            $scope.selectProperty = function (propertyUrl) {
                RestService.ontology.getProperty(propertyUrl)
                    .then(function (data) {
                        $mdDialog.hide({property: data.data});
                    });
            };

            $scope.addProperty = function (property) {
                $mdDialog.hide({property: property});

                // RestService.ontology.saveProperty(property)
                //     .then(function (status) {
                //         if (status) {
                //             $state.go('ontology.class-edit', {classUrl: $scope.clazz.url});
                //         }
                //         else {
                //             $mdDialog.show(
                //                 $mdDialog.alert()
                //                     .parent(angular.element(document.querySelector('body')))
                //                     .clickOutsideToClose(true)
                //                     .title('خطا')
                //                     .textContent('خطایی رخ داده است!')
                //                     .ariaLabel('ERROR')
                //                     .ok('خب')
                //                     .targetEvent(ev)
                //             );
                //         }
                //     });
            };
        }
    })

    .controller('OntologyPropertyController', function ($scope, RestService, $state, $stateParams, $mdDialog, $location) {

        let propertyUrl = $stateParams.propertyUrl;

        $scope.load = function () {
            RestService.ontology.getProperty(propertyUrl)
                .then(function (response) {
                    $scope.property = response.data;
                });
        };

        $scope.addProperty = function (property, ev) {
            // console.log(222);
            // console.log($scope.property);

            RestService.ontology.saveProperty($scope.property)
                .then(function (status) {
                    if (status)
                        $state.go('ontology.property', {propertyUrl: $scope.property.url});
                    else
                        $mdDialog.show(
                            $mdDialog.alert()
                                .parent(angular.element(document.querySelector('body')))
                                .clickOutsideToClose(true)
                                .title('خطا')
                                .textContent('خطایی رخ داده است!')
                                .ariaLabel('ERROR')
                                .ok('خب')
                                .targetEvent(ev)
                        );
                });
        };

        $scope.cancel = function (ev) {
            $state.go('ontology.property', {propertyUrl: $scope.property.url});
        };

        $scope.load();
    });


function renderTree(treeData, $state) {
    // var treeData = items;

// Set the dimensions and margins of the diagram
    var margin = {top: 20, right: 90, bottom: 30, left: 90},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
    var svg = d3.select("svg#tree-graphical").attr('class', 'tree')
    // .attr("width", width + margin.right + margin.left)
    // .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var i = 0,
        duration = 750,
        root;

// declares a tree layout and assigns the size
    var treemap = d3.tree().size([height, width]);

// Assigns parent, children, height, depth
    root = d3.hierarchy(treeData, function (d) {
        return d.children;
    });
    root.x0 = height / 2;
    root.y0 = 0;

// Collapse after the second level
    root.children.forEach(collapse);

    update(root);

// Collapse the node and all it's children
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function update(source) {

        // Assigns the x and y position for the nodes
        var treeData = treemap(root);

        // Compute the new tree layout.
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        let maxWidth = 0;
        let maxHeight = 0;
        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            d.x = d.x * 4;
            d.y = d.depth * 180 * 2;
            if (d.x > maxHeight) maxHeight = d.x;
            if (d.y > maxWidth) maxWidth = d.y;
        });

        // ****************** Nodes section ***************************

        // Update the nodes...
        var node = svg.selectAll('g.node')
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style("fill", function (d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", function (d) {
                return d.children || d._children ? -12 : 12;
            })
            .attr("text-anchor", function (d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function (d) {
                return d.data.label;
            })
            .on('click', function (d) {
                $state.go('ontology.class', {classUrl: d.data.url});
            });

        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 10)
            .style("fill", function (d) {
                return d._children ? "lightsteelblue" : "#fff";
            })
            .attr('cursor', 'pointer');


        // Remove any exiting nodes
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // ****************** links section ***************************

        // Update the links...
        var link = svg.selectAll('path.link')
            .data(links, function (d) {
                return d.id;
            });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', function (d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal(o, o)
            });

        // UPDATE
        var linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', function (d) {
                return diagonal(d, d.parent)
            });

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function (d) {
                var o = {x: source.x, y: source.y};
                return diagonal(o, o)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        d3.select('svg.tree')
            .style('min-height', maxHeight * 1.2)
            .style('min-width', maxWidth * 2.0);
        // console.log(maxHeight, maxWidth);

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {
            path = `M ${s.y} ${s.x}
                                    C ${(s.y + d.y) / 2} ${s.x},
                                      ${(s.y + d.y) / 2} ${d.x},
                                      ${d.y} ${d.x}`;
            return path;
        }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
    }
}