// modified hungarian algo
// https://www.researchgate.net/publication/344171921

// two publications
// https://www.researchgate.net/publication/349678365_Assignment_of_multiple_jobs_scheduling_to_a_single_machine#pf6
// https://www.researchgate.net/publication/344171921_Modified_Hungarian_method_for_unbalanced_assignment_problem_with_multiple_jobs

// this is from knogis theorum website
// let costMatrixEg3 = [
//   [2, 8, 5, 1, 9],
//  [7, 3, 6, 4, 0],
//  [1, 5, 9, 2, 7],
//  [6, 0, 3, 8, 4]
// ]

function hungarian(costMatrix) {
    const originalCost = structuredClone(costMatrix);
    const row = costMatrix.length;
    const col = costMatrix[0].length;

    if (row > col) return -1;

    // step 1
    costMatrix = loopThroughRow(costMatrix);
    // step 2
    costMatrix = loopThroughCol(costMatrix);

    let coveredRow = [];
    let coveredCol = [];
    let count = 0;
    while (count < row) {
        [count, coveredRow, coveredCol] = findMinCovering(costMatrix);
        changeCost(costMatrix, coveredRow, coveredCol);
    }
    let jobsLeft = costMatrix[0].length;
    let result = Array.from({ length: costMatrix.length }, (_) => []);
    let assignedJob = [];
    // just use assignedJob array, refactor out this jobsLeft counter
    while (jobsLeft > 0) {
        let newResult, jobsAssignedCount;
        [newResult, jobsAssignedCount] = assignJob(costMatrix, originalCost, assignedJob);
        jobsLeft -= jobsAssignedCount;
        addJob(result, newResult);
    }
    // console.log("the result is ");
    // console.log(result);
    return result;
}

export default hungarian;

function addJob(oldResult, newResult) {
    // merge the old assigned and the newly assigned
    for (let i = 0; i < oldResult.length; i++) {
        let newValue = newResult[i];
        if (newValue == undefined) continue;
        oldResult[i].push(newValue);
    }
}
function assignJob(costMatrix, originalCost, assignedJob) {
    let result = Array(costMatrix.length);
    let jobsAssigned = 0;
    // go through each row
    for (let i = 0; i < costMatrix.length; i++) {
        let hasAssigned = false;
        // check if more than one 0 in a row
        const zeroIdx = costMatrix[i].map((item, idx) => {
            return item == 0 ? idx : -1
        }).filter((item) => item != -1)
            .filter((item) => !assignedJob.includes(item));
        let currMinJob = 9999;
        if (zeroIdx.length == 0) continue;
        for (let idx of zeroIdx) {
            if (assignedJob.includes(idx)) continue;
            if (originalCost[i][idx] < currMinJob) {
                currMinJob = originalCost[i][idx];
                result[i] = idx;
                hasAssigned = true;
            }
        }
        if (hasAssigned) {
            jobsAssigned++;
            assignedJob.push(result[i]);
        }
    }
    return [result, jobsAssigned];
}

function changeCost(costMatrix, coveredRow, coveredCol) {
    // find min from uncovered and add it to intersections
    let minCost = 999;
    // finding min
    for (let i = 0; i < costMatrix.length; i++) {
        if (coveredRow.includes(i)) continue;
        for (let j = 0; j < costMatrix[0].length; j++) {
            if (coveredCol.includes(j)) continue;
            if (minCost > costMatrix[i][j]) minCost = costMatrix[i][j];
        }
    }
    // sub from uncovered
    for (let i = 0; i < costMatrix.length; i++) {
        if (coveredRow.includes(i)) continue;
        for (let j = 0; j < costMatrix[0].length; j++) {
            if (coveredCol.includes(j)) continue;
            costMatrix[i][j] -= minCost;
        }
    }
    // adding to intersections
    for (let i = 0; i < costMatrix.length; i++) {
        if (!coveredRow.includes(i)) continue;
        for (let j = 0; j < costMatrix[0].length; j++) {
            if (!coveredCol.includes(j)) continue;
            costMatrix[i][j] += minCost;
        }
    }
}

function findMinCovering(costMatrix) {
    // Minimum Cover Using Kőnig's Theorem
    // https://tryalgo.org/en/matching/2016/08/05/konig/
    const row = costMatrix.length;
    const col = costMatrix[0].length;

    // initializing the sets
    const U = new Set(); // reprs row
    const V = new Set(); // reprs col
    // reprs edges
    // Eg [2, 4] row2 and col4 are connected
    const E = [];

    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            if (costMatrix[i][j] == 0) {
                U.add(i);
                V.add(j);
                E.push([i, j]);
            }
        }
    }
    let inMatchingRow = new Set();
    let inMatchingCol = new Set();

    // finding the selectedEdges 
    const [num, selectedEdges] = maxBipartite(costMatrix, E)

    // findin the alternating path
    const [coveredRow, coveredCol] = addWithAlternatingPath(E, selectedEdges, costMatrix);

    const count = coveredRow.length + coveredCol.length;
    return [count, coveredRow, coveredCol];
}
function addWithAlternatingPath(edges, selectedEdges, graph) {
    const rowSize = graph.length;
    const colSize = graph[0].length;

    // adjacency matrix
    let MatchingEdge = Array.from({ length: rowSize }, () => Array(colSize).fill(0));
    let NotMatchingEdge = Array.from({ length: rowSize }, () => Array(colSize).fill(0));

    // this might be same as graph doe
    let edgeAdj = Array.from({ length: rowSize }, () => Array(colSize).fill(0));
    for (let [row, col] of edges) {
        edgeAdj[row][col] = 1;
    }
    for (let [row, col] of selectedEdges) {
        MatchingEdge[row][col] = 1;
    }
    for (let [row, col] of edges) {
        if (MatchingEdge[row][col] == 1) continue;
        NotMatchingEdge[row][col] = 1;
    }
    let endRow = Array.from({ length: rowSize }, (_, idx) => idx);
    let endCol = Array.from({ length: colSize }, (_, idx) => idx);
    for (let [row, col] of selectedEdges) {
        endRow = endRow.filter((value) => value != row);
        endCol = endCol.filter((value) => value != col);
    }

    // Traversible meaning can be traversed from unmatched vertex
    // initialize the Traversible
    const Traversible = [];
    for (let row of endRow) {
        Traversible.push({
            type: "row",
            idx: row,
            isMatched: false,
            prev: 0
        })
    }
    for (let col of endCol) {
        Traversible.push({
            type: "col",
            idx: col,
            isMatched: false,
            prev: 0
        })
    }

    // main loop through the traversible (BFS)
    for (let i = 0; i < Traversible.length; i++) {
        const entry = Traversible[i];
        let matrix;
        if (entry.prev % 2 == 0) matrix = NotMatchingEdge;
        else matrix = NotMatchingEdge;

        if (entry.type == "row") {
            // go through each column and add that vertix to traversible
            for (let i = 0; i < colSize; i++) {
            }
        }
        else {
            // handling for column vertic
            for (let i = 0; i < rowSize; i++) {
                // does edge exist
                const edge = matrix[i][entry.idx];
                if (edge != 1) continue;
                // check if entry already in the list
                if (Traversible.find((element) => element.idx == i && element.type == "row")) continue;
                let newPrev = entry.prev + 1;
                // if (newPrev > 3) continue; // depth limit here
                Traversible.push({
                    type: "row", idx: i, isMatched: true, prev: newPrev
                })

            }
        }
    }

    let filteredTraversible = Traversible.filter((entry) => entry.isMatched);

    // set up the final values
    const selectedCol = [];
    const selectedRow = [];
    filteredTraversible.forEach((entry) => {
        if (entry.type == "row") {
            selectedRow.push(entry.idx);
        }
        else {
            selectedCol.push(entry.idx);
        }
    })

    // add remainig column from selectedEdges
    selectedEdges.forEach(([row, col]) => {
        if (selectedCol.includes(col)) return;
        if (selectedRow.includes(row)) return;
        selectedCol.push(col);
    })
    return [selectedRow, selectedCol];
}

function maxBipartite(matrix, edges) {
    let visitedRow = Array(matrix.length).fill(0); // 0 means not visited
    let visitedCol = Array(matrix[0].length).fill(0);
    let addedEdge = [];

    return dfs(edges, visitedRow, visitedCol, addedEdge, 0, 0);

    function dfs(edges, visitedRow, visitedCol, addedEdge, max, depth) {

        let resultMax = max;
        let resultAddedEdge = [...addedEdge]; // Copy of the current added edges
        let allTimeBest = [...addedEdge];

        // Explore all edges
        for (let i = 0; i < edges.length; i++) {
            const [row, col] = edges[i];

            // Skip if either the row or the column node is already visited
            if (visitedRow[row] !== 0 || visitedCol[col] !== 0) {
                continue;
            }

            // Mark the row and column as visited
            visitedRow[row] = 1;
            visitedCol[col] = 1;
            resultAddedEdge.push(edges[i]);

            // Recurse: Try to find the next matching
            const [newMax, newMatching] = dfs(edges, [...visitedRow], [...visitedCol], [...resultAddedEdge], max + 1, depth + 1);

            // If a larger matching is found, update the result
            if (newMax > resultMax) {
                resultMax = newMax;
                allTimeBest = newMatching;
            }
            // Backtrack: Unmark the row and column, and remove the edge
            visitedRow[row] = 0;
            visitedCol[col] = 0;
            resultAddedEdge.pop();
        }
        // Return the best result found
        return [resultMax, allTimeBest];
    }
}

function loopThroughCol(costMatrix) {
    let newCost = []
    for (let i = 0; i < costMatrix[0].length; i++) {
        let col = costMatrix.map((row) => row[i]);
        let min = col.reduce((prev, curr) => { return prev < curr ? prev : curr });
        let reducedCol = col.map((value) => value - min);
        newCost.push(reducedCol);
    }
    // transpose the matrix
    return transposeMatrix(newCost)
}
function transposeMatrix(matrix) {
    const row = matrix.length;
    const col = matrix[0].length;

    let result = Array.from({ length: col }, () => Array(row).fill(0))
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            result[j][i] = matrix[i][j];
        }
    }
    return result;
}

function loopThroughRow(costMatrix) {
    let newCost = [];
    for (let row of costMatrix) {
        let min = row.reduce((prev, curr) => { return prev < curr ? prev : curr })
        let reducedRow = row.map((value) => { return value - min })
        newCost.push(reducedRow)
    }
    return newCost;
}
