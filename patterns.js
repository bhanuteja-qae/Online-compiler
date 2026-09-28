// The 15 DSA patterns shown in the sidebar.
// Each example is a plain Python script written to visualize well: pointer
// variables use the names the visualizer recognises (left/right, lo/mid/hi, i/j,
// r/c, start) and structures use telling names (stack, heap, queue, graph, dp).
// Keep example code free of backticks and "${" so it fits in String.raw literals.

const PATTERNS = [
  {
    id: "two-pointers",
    name: "Two Pointers",
    idea: "Move two indices toward each other over a sorted array to avoid a nested loop.",
    when: "Pair/triplet sums in sorted input, reversing, removing duplicates in place, palindromes.",
    complexity: "O(n) time · O(1) space",
    code: String.raw`nums = [1, 3, 5, 7, 9, 11]
target = 12

left, right = 0, len(nums) - 1
while left < right:
    total = nums[left] + nums[right]
    if total == target:
        break
    if total < target:
        left += 1       # need a bigger sum -> move L right
    else:
        right -= 1      # need a smaller sum -> move R left

print(f"{nums[left]} + {nums[right]} = {target}")
`,
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    idea: "Keep a window over a contiguous range and update it incrementally as it slides instead of recomputing it.",
    when: "Max/min/sum of size-k subarrays, longest substring with a property, anagram search.",
    complexity: "O(n) time · O(1) space",
    code: String.raw`nums = [2, 1, 5, 1, 3, 2, 4]
k = 3

window = sum(nums[:k])
best = window
left, right = 0, k - 1
while right + 1 < len(nums):
    right += 1
    window += nums[right] - nums[left]   # add the new, drop the old
    left += 1
    best = max(best, window)

print("max sum of a window of size", k, "=", best)
`,
  },
  {
    id: "binary-search",
    name: "Binary Search",
    idea: "Halve the search space each step by comparing the middle element (L, M, R).",
    when: "Sorted arrays, first/last position, rotated arrays, searching on the answer space.",
    complexity: "O(log n) time · O(1) space",
    code: String.raw`nums = [1, 3, 5, 7, 9, 11, 13]
target = 11

lo, hi = 0, len(nums) - 1
found = -1
while lo <= hi:
    mid = (lo + hi) // 2
    if nums[mid] == target:
        found = mid
        break
    if nums[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1

print("found", target, "at index", found)
`,
  },
  {
    id: "frequency-counting",
    name: "Frequency Counting",
    idea: "Count occurrences in a hash map so later questions become O(1) lookups.",
    when: "Anagrams, first unique character, majority element, duplicates, most frequent.",
    complexity: "O(n) time · O(k) space",
    code: String.raw`chars = ["a", "b", "a", "c", "b"]

count = {}
for i in range(len(chars)):
    ch = chars[i]
    count[ch] = count.get(ch, 0) + 1

first_unique = None
for ch in chars:
    if count[ch] == 1:
        first_unique = ch
        break

print("counts:", count)
print("first unique:", first_unique)
`,
  },
  {
    id: "matrix-traversal",
    name: "Matrix Traversal",
    idea: "Walk a 2-D grid with a position (r, c) and direction vectors, turning when you hit a wall or a visited cell.",
    when: "Spiral order, rotating images, flood fill, counting islands, grid paths.",
    complexity: "O(rows × cols) time",
    code: String.raw`matrix = [
    [1,  2,  3,  4],
    [12, 13, 14, 5],
    [11, 16, 15, 6],
    [10, 9,  8,  7],
]
rows, cols = len(matrix), len(matrix[0])
seen = [[False] * cols for _ in range(rows)]
dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]   # right, down, left, up

out = []
r = c = d = 0
for _ in range(rows * cols):
    out.append(matrix[r][c])
    seen[r][c] = True
    nr, nc = r + dirs[d][0], c + dirs[d][1]
    if not (0 <= nr < rows and 0 <= nc < cols) or seen[nr][nc]:
        d = (d + 1) % 4                      # turn clockwise
        nr, nc = r + dirs[d][0], c + dirs[d][1]
    r, c = nr, nc

print("spiral order:", out)
`,
  },
  {
    id: "monotonic-stack",
    name: "Monotonic Stack",
    idea: "Keep a stack whose values stay sorted; each pop reveals the next greater element of the popped item.",
    when: "Next greater element, daily temperatures, largest rectangle in a histogram, stock span.",
    complexity: "O(n) time · O(n) space",
    code: String.raw`nums = [1, 3, 2, 4]

next_greater = {}
stack = []          # values, decreasing from bottom to top
for i in range(len(nums)):
    x = nums[i]
    while stack and stack[-1] < x:
        next_greater[stack.pop()] = x
    stack.append(x)

for x in stack:     # nothing greater to the right
    next_greater[x] = -1

print([next_greater[x] for x in nums])
`,
  },
  {
    id: "prefix-sum",
    name: "Prefix Sum",
    idea: "Precompute running totals so any range sum is one subtraction: sum(i..j) = prefix[j+1] - prefix[i].",
    when: "Many range-sum queries, subarray sum equals k, 2-D region sums, equilibrium index.",
    complexity: "O(n) build · O(1) per query",
    code: String.raw`nums = [1, 2, 3, 4]

prefix = [0] * (len(nums) + 1)
for i in range(len(nums)):
    prefix[i + 1] = prefix[i] + nums[i]

# sum of nums[1..3] inclusive
i, j = 1, 3
print("sum(1..3) =", prefix[j + 1] - prefix[i])
`,
  },
  {
    id: "overlapping-intervals",
    name: "Overlapping Intervals",
    idea: "Sort intervals by start, then merge each one into the previous if they overlap.",
    when: "Merge intervals, insert interval, meeting rooms, free time, interval intersections.",
    complexity: "O(n log n) time for the sort",
    code: String.raw`intervals = [[1, 4], [3, 6], [8, 10], [9, 12], [15, 18]]
intervals.sort()

merged = []
for start, end in intervals:
    if merged and start <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], end)   # overlap -> extend
    else:
        merged.append([start, end])

print(merged)
`,
  },
  {
    id: "greedy",
    name: "Greedy",
    idea: "Make the locally best choice at each step (pick the largest coin that fits) and never revisit it.",
    when: "Coin change with canonical coins, activity selection, jump game, gas station. Prove the greedy choice is safe first.",
    complexity: "Usually O(n) or O(n log n)",
    code: String.raw`coins = [25, 10, 5, 1]
amount = 40

used = []
for i in range(len(coins)):
    while amount >= coins[i]:     # pick the largest coin that fits
        amount -= coins[i]
        used.append(coins[i])

print("used:", used)
`,
  },
  {
    id: "top-k",
    name: "Top K Elements",
    idea: "Keep a min-heap of size K; its root is the weakest survivor, so anything smaller gets dropped.",
    when: "K largest/smallest, K most frequent, K closest points, kth largest in a stream.",
    complexity: "O(n log k) time · O(k) space",
    code: String.raw`import heapq

nums = [3, 1, 5, 12, 2, 11, 7]
k = 3

heap = []                       # min-heap holding the k largest so far
for x in nums:
    heapq.heappush(heap, x)
    if len(heap) > k:
        heapq.heappop(heap)     # drop the smallest

print("top", k, ":", sorted(heap, reverse=True))
`,
  },
  {
    id: "backtracking",
    name: "Backtracking",
    idea: "Build a solution one choice at a time: choose, explore, then undo the choice and try the next one.",
    when: "Subsets, permutations, combinations, N-Queens, Sudoku, word search.",
    complexity: "Exponential: O(2ⁿ) subsets, O(n!) permutations",
    code: String.raw`nums = [1, 2, 3]
result = []
path = []


def explore(start):
    result.append(path[:])
    for i in range(start, len(nums)):
        path.append(nums[i])    # choose
        explore(i + 1)          # explore
        path.pop()              # un-choose (backtrack)


explore(0)
print(result)
`,
  },
  {
    id: "binary-tree-traversal",
    name: "Binary Tree Traversal",
    idea: "Visit every node recursively: pre-order (N-L-R), in-order (L-N-R) or post-order (L-R-N).",
    when: "Height, path sums, validating a BST (in-order is sorted), serializing, lowest common ancestor.",
    complexity: "O(n) time · O(h) stack space",
    code: String.raw`class Node:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


root = Node(4, Node(2, Node(1), Node(3)), Node(6, Node(5), Node(7)))
out = []


def inorder(node):
    if node is None:
        return
    inorder(node.left)
    out.append(node.val)
    inorder(node.right)


inorder(root)
print("in-order:", out)
`,
  },
  {
    id: "dfs",
    name: "Depth-First Search",
    idea: "Go as deep as possible along one branch before backing up (recursion or an explicit stack).",
    when: "Connected components, cycle detection, topological sort, path existence, islands.",
    complexity: "O(V + E) time · O(V) space",
    code: String.raw`graph = {
    "A": ["B", "D"],
    "B": ["A", "C", "E"],
    "C": ["B", "E"],
    "D": ["A", "E"],
    "E": ["B", "C", "D"],
}
seen = set()
order = []


def dfs(node):
    seen.add(node)
    order.append(node)
    for nxt in graph[node]:
        if nxt not in seen:
            dfs(nxt)            # go deep first


dfs("A")
print("DFS:", " ".join(order))
`,
  },
  {
    id: "bfs",
    name: "Breadth-First Search",
    idea: "Explore level by level with a queue; the first visit to a node is along a shortest (unweighted) path.",
    when: "Shortest path in unweighted graphs/grids, level-order traversal, minimum steps.",
    complexity: "O(V + E) time · O(V) space",
    code: String.raw`from collections import deque

graph = {
    "A": ["B", "D"],
    "B": ["A", "C", "E"],
    "C": ["B", "E"],
    "D": ["A", "E"],
    "E": ["B", "C", "D"],
}

dist = {"A": 0}
queue = deque(["A"])
order = []
while queue:
    node = queue.popleft()
    order.append(node)
    for nxt in graph[node]:
        if nxt not in dist:
            dist[nxt] = dist[node] + 1
            queue.append(nxt)

print("BFS:", " ".join(order))
print("distance from A:", dist)
`,
  },
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    idea: "Store each sub-problem's answer once and build on it: dp[i][j] = dp[i-1][j] + dp[i][j-1].",
    when: "Counting paths, knapsack, longest common subsequence, edit distance, min-coin change.",
    complexity: "states × work per state, here O(rows × cols)",
    code: String.raw`rows, cols = 3, 4

# dp[i][j] = number of ways to reach cell (i, j) moving only right or down
dp = [[1] * cols for _ in range(rows)]
for i in range(1, rows):
    for j in range(1, cols):
        dp[i][j] = dp[i - 1][j] + dp[i][j - 1]   # from above + from the left

print("unique paths:", dp[rows - 1][cols - 1])
`,
  },
];

if (typeof module !== "undefined") module.exports = PATTERNS;
