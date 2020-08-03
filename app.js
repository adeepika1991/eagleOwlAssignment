const tabledArray = [];
getData();
async function getData () {
	const response = await fetch('./customerdata.txt');
	const data = await response.text();
	//console.log(data);

	const titles = data.slice(0, data.indexOf('\n')).split(',');

	const rows = data.slice(data.indexOf('\n') + 1).split('\n').filter((item) => item.trim().length > 0);
	const result = rows.map((item) => {
		const row = item.split(',');
		return titles.reduce((acc, curr, i) => ((acc[curr.trim()] = row[i].trim()), acc), {});
	});

	//console.log(result);

	const names = result
		.map((element) => element.Name)
		.reduce((b, c) => ((b[b.findIndex((d) => d.el === c)] || b[b.push({ el: c, count: 0 }) - 1]).count++, b), []);

	function counter (number) {
		if (number >= 5) {
			let a = names.filter((element) => element.count >= 5);
			let b = tabledArray.push({ Orders: number + '+', Customers: a.length });
			return b;
		}
		let c = names.filter((element) => element.count === number);
		let d = tabledArray.push({ Orders: number, Customers: c.length });
		return d;
	}
	counter(1);
	counter(2);
	counter(3);
	counter(4);
	counter(5);

	//console.log(tabledArray);

	const totalOrders = result.length;

	const totalAmount = result.map((item) => Number(item.Amount)).reduce((acc, i) => acc + i, 0);

	document.getElementById('question1').innerHTML = 'Total no.of Orders the site received is : ' + totalOrders;
	document.getElementById('question2').innerHTML = 'Total amount from all the orders : ' + totalAmount;
	document.getElementById('question3').innerHTML = 'The List of customers ordered once : ';

	const oneOrder = names.filter((item) => item.count === 1).map((item) => item.el);

	let listOfCustomers = [];
	var list = document.getElementById('list');

	oneOrder.forEach(function (element) {
		listOfCustomers.push('<li>' + element + '</li>');
	});

	list.innerHTML = listOfCustomers.join('');

	function generateTableHead (table, data1) {
		let thead = table.createTHead();
		let row = thead.insertRow();
		for (let key of data1) {
			let th = document.createElement('th');
			let text = document.createTextNode(key);
			th.appendChild(text);
			row.appendChild(th);
		}
	}

	function generateTable (table, data1) {
		for (let element of data1) {
			let row = table.insertRow();
			for (key in element) {
				let cell = row.insertCell();
				let text = document.createTextNode(element[key]);
				cell.appendChild(text);
			}
		}
	}

	let table = document.querySelector('table');
	let data1 = Object.keys(tabledArray[0]);
	generateTableHead(table, data1);
	generateTable(table, tabledArray);

	order();
}

function order () {
	//console.log(tabledArray.map((item) => item.orders));

	const margin = 80;
	const width = 1000 - 2 * margin;
	const height = 600 - 2 * margin;

	const svg = d3.select('svg');
	//const svgContainer = d3.select('#container');

	const chart = svg.append('g').attr('transform', `translate(${margin}, ${margin})`);

	const xScale = d3.scaleBand().range([ 0, width ]).domain(tabledArray.map((s) => s.Orders)).padding(0.4);

	const yScale = d3.scaleLinear().range([ height, 0 ]).domain([ 0, 16 ]);

	const makeYLines = () => d3.axisLeft().scale(yScale);

	chart.append('g').attr('transform', `translate(0, ${height})`).call(d3.axisBottom(xScale));

	chart.append('g').call(d3.axisLeft(yScale));

	chart
		.selectAll()
		.data(tabledArray)
		.enter()
		.append('rect')
		.attr('x', (s) => xScale(s.Orders))
		.attr('y', (s) => yScale(s.Customers))
		.attr('height', (s) => height - yScale(s.Customers))
		.attr('width', xScale.bandwidth());

	chart.append('g').attr('class', 'grid').call(d3.axisLeft().scale(yScale).tickSize(-width, 0, 0).tickFormat(''));

	const barGroups = chart.selectAll().data(tabledArray).enter().append('g');

	barGroups
		.append('rect')
		.attr('class', 'bar')
		.attr('x', (g) => xScale(g.Orders))
		.attr('y', (g) => yScale(g.Customers))
		.attr('height', (g) => height - yScale(g.Customers))
		.attr('width', xScale.bandwidth())
		.on('mouseenter', function (actual, i) {
			d3.selectAll('.value').attr('opacity', 0);

			d3
				.select(this)
				.transition()
				.duration(300)
				.attr('opacity', 0.6)
				.attr('x', (a) => xScale(a.Orders) - 5)
				.attr('width', xScale.bandwidth() + 10);

			const y = yScale(actual.Customers);

			line = chart.append('line').attr('id', 'limit').attr('x1', 0).attr('y1', y).attr('x2', width).attr('y2', y);
		})
		.on('mouseleave', function () {
			d3.selectAll('.customers').attr('opacity', 1);

			d3
				.select(this)
				.transition()
				.duration(300)
				.attr('opacity', 1)
				.attr('x', (a) => xScale(a.Orders))
				.attr('width', xScale.bandwidth());

			chart.selectAll('#limit').remove();
		});

	barGroups
		.append('text')
		.attr('class', 'value')
		.attr('x', (a) => xScale(a.Orders) + xScale.bandwidth() / 2)
		.attr('y', (a) => yScale(a.Customers) + 30)
		.attr('text-anchor', 'middle');

	svg
		.append('text')
		.attr('x', -(height / 2) - margin)
		.attr('y', margin / 2.4)
		.attr('transform', 'rotate(-90)')
		.attr('text-anchor', 'middle')
		.text('Count of Customers');

	svg
		.append('text')
		.attr('class', 'label')
		.attr('x', width / 2 + margin)
		.attr('y', height + margin * 1.7)
		.attr('text-anchor', 'middle')
		.text('Frequency of orders');

	svg
		.append('text')
		.attr('x', width / 2 + margin)
		.attr('y', 40)
		.attr('text-anchor', 'middle')
		.text('Distribution of customers according to their order frequency');
}
