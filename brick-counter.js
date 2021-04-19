let currentCombo = 1;
let comboCounter = 0;
let comboId = undefined;

const handleComboItemClick = (event) => {
	const comboId = event.target.getAttribute('combo-id');
	const cardNodes = document.querySelectorAll('[id="' + comboId + '"]');
	const radioNodes = document.querySelectorAll('.card-radio');

	cardNodes.forEach((node) => {
		node.remove();
	});

	radioNodes.forEach((node) => {
		if(node.checked) {
			currentCombo = 0;
			comboCounter = 0;
		}
	});

	event.target.remove();
};

const handleComboItemEnter = (event) => {
	const comboId = event.target.getAttribute('combo-id');
	const cardNodes = document.querySelectorAll('[id="' + comboId + '"]');

	cardNodes.forEach((node) => {
		node.style['border-color'] = '#ff0000';
		node.style['opacity'] = '100%';
		node.style['z-index'] = '1';
	});
};

const handleComboItemLeave = (event) => {
	const comboId = event.target.getAttribute('combo-id');
	const cardNodes = document.querySelectorAll('[id="' + comboId + '"]');

	cardNodes.forEach((node) => {
		node.style['border-color'] = '#000000';
		node.style['opacity'] = '60%';
		node.style['z-index'] = '-1';
	});
};

const handleToastClose = () => {
	const toast = document.querySelector('.toast');
	toast.style['visibility'] = 'hidden';
};

const buildDeck = () => {
	let deck = [];
	const cardNodes = document.querySelectorAll('.card');

	cardNodes.forEach((cardNode) => {
		let card = {};
		const comboNodes = cardNode.querySelectorAll('.combo');

		comboNodes.forEach((comboNode) => {
			card[comboNode.getAttribute('combo')] = comboNode.getAttribute('id');
		});

		deck.push(card);
	});

	return deck;
};

const calcBricks = () => {
	const deck = buildDeck();
	const nTests = parseInt(document.querySelector('.number-of-tests').value);
	let nBrickFirst = 0;
	let nBrickSecond = 0;

	for (let i = 0; i < nTests; i++) {
		shuffle(deck);
		const isBrickedFirst = buildHand(deck, 5);
		const isBrickedSecond = buildHand(deck, 6);

		if(isBrickedFirst) nBrickFirst += 1;
		if(isBrickedSecond) nBrickSecond += 1;
	}

	showBrickToast(nBrickFirst, nBrickSecond, nTests);
};

const buildHand = (deck, size) => {
	const hand = deck.slice(0, size);
	let combosObj = {};

	hand.forEach((card) => {
		for(const combo in card) {
			const comboSize = parseInt(combo[combo.length - 1]);
			if(!combosObj[card[combo]]) {
				combosObj[card[combo]] = {count: 1, size: comboSize};
			}
			else {
				combosObj[card[combo]]['count'] += 1;
			}
		}
	});

	return checkIsBricked(combosObj);
};

const checkIsBricked = (combosObj) => {
	for(const combo in combosObj) {
		if(combosObj[combo]['count'] >= combosObj[combo]['size']) return false;
	}

	return true;
};

const showBrickToast = (nBrickFirst, nBrickSecond, nTests) => {
	const toast = document.querySelector('.toast');
	const toastMessage = document.querySelector('.toast-message');
	let message = '';

	message += '% of bricked hands going first: ' + nBrickFirst / nTests * 100 + '%' + '\n';
	message += '% of bricked hands going second: ' + nBrickSecond / nTests * 100 + '%';
	
	toastMessage.innerHTML = message;
	toast.style['visibility'] = 'visible';
	hideSpinner();
};

const handleCardClick = (event) => {
	const radioNodes = document.querySelectorAll('.card-radio');

	radioNodes.forEach((node) => {
		if(node.checked) {
			if(node.value === 'c-1') {
				const combo = event.target.querySelector('.' + node.value + '[id="single"]');

				if(!combo) {
					addCombo(event.target, node.value, 'single');
				}
				else {
					event.target.removeChild(combo);
				}
			}
			else {
				if(parseInt(node.value[node.value.length -1]) !== currentCombo) {
					newCombo(node.value, event.target);
				}
				else {
					if(comboCounter === currentCombo) {
						newCombo(node.value, event.target);
					}
					else {
						addCombo(event.target, node.value, comboId);
						comboCounter += 1;
					}
				}
			}
		}
	});
};

const addCombo = (card, combo, comboId) => {
	let comboEl = document.createElement('div');

	comboEl.className += combo;
	comboEl.className += ' combo';
	comboEl.setAttribute('combo', combo);
	comboEl.setAttribute('id', comboId);

	card.appendChild(comboEl);
};

const newCombo = (combo, card) => {
	const trackerNode = document.querySelector('.combo-tracker');
	let comboItem = document.createElement('span');

	currentCombo = parseInt(combo[combo.length - 1]);
	comboCounter = 0;
	comboId = uuid();
	addCombo(card, combo, comboId);
	comboCounter += 1;

	comboItem.addEventListener('click', handleComboItemClick);
	comboItem.addEventListener('mouseenter', handleComboItemEnter);
	comboItem.addEventListener('mouseleave', handleComboItemLeave);
	comboItem.classList.add('combo-tracker-item');
	comboItem.setAttribute('combo-id', comboId);
	comboItem.innerHTML = combo;

	trackerNode.appendChild(comboItem);
};

const showSpinner = () => {document.querySelector('.spinner').style['visibility'] = 'visible';};
const hideSpinner = () => {document.querySelector('.spinner').style['visibility'] = 'hidden';};

const shuffle = (a,b,c,d) => {
	c=a.length;while(c)b=Math.random()*c--|0,d=a[c],a[c]=a[b],a[b]=d
};

const uuid = () => {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
};

window.addEventListener('load', () => {
	for(let x = 0; x < 40; x++) {
		let card = document.createElement('div');

		card.className = 'card';
		card.addEventListener('click', handleCardClick);
		deck = document.querySelector('.deck');

		deck.appendChild(card);
	}

	const btnNode = document.querySelector('.calc-btn');
	btnNode.addEventListener('mousedown', () => {showSpinner();});
	btnNode.addEventListener('mouseup', () => {calcBricks(); hideSpinner();});
});
