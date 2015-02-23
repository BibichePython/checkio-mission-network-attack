//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            var default_in = [
                [0, 1, 0, 1, 0, 0],
                [1, 8, 1, 0, 0, 0],
                [0, 1, 2, 0, 0, 1],
                [1, 0, 0, 1, 1, 0],
                [0, 0, 0, 1, 3, 1],
                [0, 0, 1, 0, 1, 2]
            ];
            var checkioInput = data.in || default_in;
            var checkioInputStr = 'capture([<br>' + checkioInput.map(JSON.stringify).join(",<br>") + ',<br>])';

            var failError = function (dError) {
                $content.find('.call').html('Fail: ' + checkioInputStr);
                $content.find('.output').html(dError.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
            };

            if (data.error) {
                failError(data.error);
                return false;
            }

            if (data.ext && data.ext.inspector_fail) {
                failError(data.ext.inspector_result_addon);
                return false;
            }

            var rightResult = data.ext["answer"];
            var userResult = data.out;
            var result = data.ext["result"];
            var result_addon = data.ext["result_addon"];


            //if you need additional info from tests (if exists)
            var explanation = data.ext["explanation"];

            $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));

            if (!result) {
                $content.find('.call').html('Fail: ' + checkioInputStr);
                $content.find('.answer').html('Right result:&nbsp;' + JSON.stringify(rightResult));
                $content.find('.answer').addClass('error');
                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: ' + checkioInputStr);
                $content.find('.answer').remove();
            }
            //Dont change the code before it

            if (explanation) {
                var canvas = new Network();
                canvas.draw($content.find(".explanation")[0], checkioInput);
                canvas.animate(explanation, checkioInput);
            }


            this_e.setAnimationHeight($content.height() + 60);

        });

        //This is for Tryit (but not necessary)
//        var $tryit;
//        ext.set_console_process_ret(function (this_e, ret) {
//            $tryit.find(".checkio-result").html("Result<br>" + ret);
//        });
//
//        ext.set_generate_animation_panel(function (this_e) {
//            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit'))).find('.tryit-content');
//            $tryit.find('.bn-check').click(function (e) {
//                e.preventDefault();
//                this_e.sendToConsoleCheckiO("something");
//            });
//        });

        function Network(options) {

            var format = Raphael.format;

            //Colors
            var colorOrange4 = "#F0801A";
            var colorOrange3 = "#FA8F00";
            var colorOrange2 = "#FAA600";
            var colorOrange1 = "#FABA00";

            var colorBlue4 = "#294270";
            var colorBlue3 = "#006CA9";
            var colorBlue2 = "#65A1CF";
            var colorBlue1 = "#8FC7ED";

            var colorGrey4 = "#737370";
            var colorGrey3 = "#9D9E9E";
            var colorGrey2 = "#C5C6C6";
            var colorGrey1 = "#EBEDED";

            var colorWhite = "#FFFFFF";

            options = options || {};

            var R = options.radius || 160;
            var objR = 20;
//            var w = 25;
//            var h = 10;

            var x0 = 10;

            var sizeX = 2 * x0 + 2 * (R + objR);
            var sizeY = 2 * x0 + 2 * (R + objR);

            var centerX = x0 + R + objR;
            var centerY = x0 + R + objR;


            var paper;
            var networkObjects = {};
            var networkLines = {};

            var stepTime = 300;

            var attrCircle = {"stroke": colorBlue4, "stroke-width": 2, "fill": colorBlue1};
//            var attrRect = {"stroke": colorBlue4, "stroke-width": 2, "fill": colorBlue1};
            var attrNumber = {"font-family": "Roboto, Verdana, Geneva, sans-serif", "font-size": objR * 1.5};
//            var attrName = {"font-family": "Roboto, Verdana, Geneva, sans-serif", "font-size": h};
            var attrLine = {"stroke": colorBlue2, "stroke-width": 5};

            this.draw = function (dom, matrix) {
                paper = Raphael(dom, sizeX, sizeY);
                var angle = Math.PI * 2 / matrix.length;
                for (var i = 0; i < matrix.length; i++) {
                    var obj = paper.set();
                    var x = centerX - Math.cos(i * angle) * R;
                    var y = centerY - Math.sin(i * angle) * R;
                    obj.push(paper.circle(x, y, objR).attr(attrCircle).attr("stroke-width", matrix[i][i]));
//                    obj.push(paper.circ(x - w, y - h, objR).attr(attrRect));


                    if (i === 0) {
                        obj[0].attr("fill", colorOrange4);
                    }
                    obj.push(paper.text(x, y, i).attr(attrNumber));
//                    obj.push(paper.text(x, y, names[i]).attr(attrName));
                    obj.x = x;
                    obj.y = y;
                    networkObjects[i] = obj;
                    networkLines[i] = [];
                }
                for (i = 0; i < matrix.length; i++) {
                    for (var j = i + 1; j < matrix.length; j++) {
                        if (matrix[i][j] === 0) {
                            continue;
                        }
                        var fr = networkObjects[i];
                        var to = networkObjects[j];
                        var p = paper.path(
                            format("M{0},{1}L{2},{3}",
                                fr.x,
                                fr.y,
                                to.x,
                                to.y)).attr(attrLine).toBack();
                        networkLines[i].push(p);
                        networkLines[j].push(p);
                        if (i === 0) {
                            p.attr("stroke", colorOrange4);
                        }
                    }
                }
            };

            this.animate = function(expl, matrix) {
                for (var k = 0; k < matrix.length; k++) {
                    setTimeout(function(node) {
                        return function() {
                            networkObjects[node].animate({"stroke-width": 0}, stepTime * matrix[node][node],
                            callback=function(){
                                networkObjects[node][0].attr("fill", colorOrange4);
                                for (var n = 0; n < networkLines[node].length; n++) {
                                    networkLines[node][n].attr("stroke", colorOrange4);
                                }
                            });
                        }
                    }(k), expl[k] * stepTime);
                }
            }
        }

        //Your Additional functions or objects inside scope
        //
        //
        //


    }
);
