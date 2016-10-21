// adapted from https://gist.github.com/axelpale/3118596
function getcombs(set, k) {
	var i, j, combs, head, tailcombs;
	
	if (k > set.length || k <= 0) {
		return [];
	}
	
	if (k == set.length) {
		return [set];
	}
	
	if (k == 1) {
		combs = [];
		for (i = 0; i < set.length; i++) {
			combs.push([set[i]]);
		}
		return combs;
	}
	
	combs = [];

	// in turn select each element in the set as being the 'head' (the first in the combination)
	// recursively find all the combinations of the tail, concatting the head to each
	for (i = 0; i < set.length - k + 1; i++) {
		head = set.slice(i, i+1);
		tailcombs = getcombs(set.slice(i + 1), k - 1); // recurse
		for (j = 0; j < tailcombs.length; j++) {
			combs.push(head.concat(tailcombs[j])); // concat the head to the results
		}
	}
	return combs;
}

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

// [a,b] -> [b,a]
function swap(o){
    var uno = o[0];
    var dos = o[1];
    o[0] = dos;
    o[1] = uno;
}