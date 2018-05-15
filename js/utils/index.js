export const drawText = function(t, x, y, w, context, scale = 1) {
  var chr = t.split("");
  var temp = "";
  var row = [];

  context.fillStyle = "#000";
  context.font = `${16*scale}px Arial`;
  context.textBaseline = "middle";

  for (var a = 0; a < chr.length; a++) {
    if (context.measureText(temp).width < w) {
      ;
    }
    else {
      row.push(temp);
      temp = "";
    }
    temp += chr[a];
  }

  row.push(temp);

  for (var b = 0; b < row.length; b++) {
    context.fillText(row[b], x, y + (b + 1) * 20 * scale);
  }
}