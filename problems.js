// Practice problems, three per DSA pattern (at least one Easy), drawn from well-known LeetCode and
// HackerRank questions. Statements are short paraphrases written for this
// project; each links to the original page for the full text.
//
// Fields: fn is the function the tests call; tests hold JSON args/expected;
// compare is "exact" | "unordered" (order of the returned list does not matter)
// | "nested_unordered" (neither outer nor inner order matters); argTypes marks
// arguments to convert before the call ("tree" = LeetCode level-order list).
// Keep code free of backticks and "${" so it fits in String.raw literals.

const LC = (slug) => "https://leetcode.com/problems/" + slug + "/";
const HR = (slug) => "https://www.hackerrank.com/challenges/" + slug + "/problem";

const PROBLEMS = [
  // ------------------------------------------------------------ 1. Two Pointers
  {
    id: "valid-palindrome",
    title: "Valid Palindrome",
    pattern: "two-pointers",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 125", url: LC("valid-palindrome") }],
    desc: "Given a string, ignore every character that is not a letter or digit and ignore letter case. Return True if what remains reads the same forwards and backwards.",
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: "True" },
      { input: 's = "race a car"', output: "False" },
    ],
    fn: "is_palindrome",
    tests: [
      { args: ["A man, a plan, a canal: Panama"], expected: true },
      { args: ["race a car"], expected: false },
      { args: [" "], expected: true },
      { args: ["0P"], expected: false },
      { args: ["Was it a car or a cat I saw?"], expected: true },
    ],
    starter: String.raw`def is_palindrome(s):
    # Hint: move a left and a right pointer toward each other,
    # skipping characters that are not letters or digits.
    pass


print(is_palindrome("A man, a plan, a canal: Panama"))
`,
    solution: String.raw`def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if not s[left].isalnum():
            left += 1
        elif not s[right].isalnum():
            right -= 1
        elif s[left].lower() != s[right].lower():
            return False
        else:
            left += 1
            right -= 1
    return True


print(is_palindrome("race a car"))
`,
  },
  {
    id: "container-with-most-water",
    title: "Container With Most Water",
    pattern: "two-pointers",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 11", url: LC("container-with-most-water") }],
    desc: "height[i] is the height of a vertical line at position i. Pick two lines that, together with the x-axis, hold the most water. The amount is (distance between the lines) × (the shorter line). Return that maximum amount.",
    examples: [{ input: "height = [1, 8, 6, 2, 5, 4, 8, 3, 7]", output: "49" }],
    fn: "max_area",
    tests: [
      { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { args: [[1, 1]], expected: 1 },
      { args: [[4, 3, 2, 1, 4]], expected: 16 },
      { args: [[1, 2, 1]], expected: 2 },
    ],
    starter: String.raw`def max_area(height):
    # Hint: start with the widest pair and always move the shorter line inward.
    pass


print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))
`,
    solution: String.raw`def max_area(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        water = (right - left) * min(height[left], height[right])
        best = max(best, water)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return best


print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))
`,
  },

  // ------------------------------------------------------------ 2. Sliding Window
  {
    id: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    pattern: "sliding-window",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 121", url: LC("best-time-to-buy-and-sell-stock") }],
    desc: "prices[i] is a stock's price on day i. Buy on one day and sell on a later day. Return the largest possible profit, or 0 if no trade makes money.",
    examples: [
      { input: "prices = [7, 1, 5, 3, 6, 4]", output: "5  (buy at 1, sell at 6)" },
      { input: "prices = [7, 6, 4, 3, 1]", output: "0" },
    ],
    fn: "max_profit",
    tests: [
      { args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { args: [[7, 6, 4, 3, 1]], expected: 0 },
      { args: [[2, 4, 1]], expected: 2 },
      { args: [[3, 2, 6, 5, 0, 3]], expected: 4 },
      { args: [[1]], expected: 0 },
    ],
    starter: String.raw`def max_profit(prices):
    # Hint: left = cheapest buy day so far, right = today's sell day.
    pass


print(max_profit([7, 1, 5, 3, 6, 4]))
`,
    solution: String.raw`def max_profit(prices):
    left = 0                  # buy day
    best = 0
    for right in range(1, len(prices)):
        if prices[right] < prices[left]:
            left = right      # found a cheaper day to buy
        else:
            best = max(best, prices[right] - prices[left])
    return best


print(max_profit([7, 1, 5, 3, 6, 4]))
`,
  },
  {
    id: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    pattern: "sliding-window",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 3", url: LC("longest-substring-without-repeating-characters") }],
    desc: "Return the length of the longest contiguous piece of the string in which no character appears twice.",
    examples: [
      { input: 's = "abcabcbb"', output: '3  ("abc")' },
      { input: 's = "pwwkew"', output: '3  ("wke")' },
    ],
    fn: "length_of_longest_substring",
    tests: [
      { args: ["abcabcbb"], expected: 3 },
      { args: ["bbbbb"], expected: 1 },
      { args: ["pwwkew"], expected: 3 },
      { args: [""], expected: 0 },
      { args: ["dvdf"], expected: 3 },
      { args: ["abba"], expected: 2 },
    ],
    starter: String.raw`def length_of_longest_substring(s):
    # Hint: grow the window with right; shrink it from left while it has a repeat.
    pass


print(length_of_longest_substring("abcabcbb"))
`,
    solution: String.raw`def length_of_longest_substring(s):
    chars = list(s)
    window = set()
    left = 0
    best = 0
    for right in range(len(chars)):
        while chars[right] in window:
            window.remove(chars[left])
            left += 1
        window.add(chars[right])
        best = max(best, right - left + 1)
    return best


print(length_of_longest_substring("abcabcbb"))
`,
  },

  // ------------------------------------------------------------ 3. Binary Search
  {
    id: "binary-search",
    title: "Binary Search",
    pattern: "binary-search",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 704", url: LC("binary-search") }],
    desc: "nums is sorted in ascending order. Return the index of target, or -1 if it is not there. Aim for O(log n).",
    examples: [
      { input: "nums = [-1, 0, 3, 5, 9, 12], target = 9", output: "4" },
      { input: "nums = [-1, 0, 3, 5, 9, 12], target = 2", output: "-1" },
    ],
    fn: "search",
    tests: [
      { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { args: [[5], 5], expected: 0 },
      { args: [[1, 3], 3], expected: 1 },
      { args: [[1, 3, 5, 7, 9, 11, 13], 1], expected: 0 },
    ],
    starter: String.raw`def search(nums, target):
    # Hint: keep lo and hi around the part that could still hold target.
    pass


print(search([-1, 0, 3, 5, 9, 12], 9))
`,
    solution: String.raw`def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


print(search([-1, 0, 3, 5, 9, 12], 9))
`,
  },
  {
    id: "search-in-rotated-sorted-array",
    title: "Search in Rotated Sorted Array",
    pattern: "binary-search",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 33", url: LC("search-in-rotated-sorted-array") }],
    desc: "A sorted array of distinct numbers was rotated at an unknown point, e.g. [0,1,2,4,5,6,7] became [4,5,6,7,0,1,2]. Return the index of target or -1, in O(log n).",
    examples: [
      { input: "nums = [4, 5, 6, 7, 0, 1, 2], target = 0", output: "4" },
      { input: "nums = [4, 5, 6, 7, 0, 1, 2], target = 3", output: "-1" },
    ],
    fn: "search_rotated",
    tests: [
      { args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { args: [[1], 0], expected: -1 },
      { args: [[3, 1], 1], expected: 1 },
      { args: [[5, 1, 3], 5], expected: 0 },
      { args: [[6, 7, 1, 2, 3, 4, 5], 7], expected: 1 },
    ],
    starter: String.raw`def search_rotated(nums, target):
    # Hint: at every mid, one half (lo..mid or mid..hi) is still sorted.
    pass


print(search_rotated([4, 5, 6, 7, 0, 1, 2], 0))
`,
    solution: String.raw`def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:                 # left half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                                     # right half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1


print(search_rotated([4, 5, 6, 7, 0, 1, 2], 0))
`,
  },

  // ------------------------------------------------------------ 4. Frequency Counting
  {
    id: "sales-by-match",
    title: "Sales by Match",
    pattern: "frequency-counting",
    difficulty: "Easy",
    sources: [{ site: "HackerRank", url: HR("sock-merchant") }],
    desc: "A pile of socks is given as a list of colour numbers. Two socks of the same colour make a pair. Return how many pairs you can make.",
    examples: [{ input: "socks = [10, 20, 20, 10, 10, 30, 50, 10, 20]", output: "3" }],
    fn: "sock_pairs",
    tests: [
      { args: [[10, 20, 20, 10, 10, 30, 50, 10, 20]], expected: 3 },
      { args: [[1, 2, 1, 2, 1, 3, 2]], expected: 2 },
      { args: [[1]], expected: 0 },
      { args: [[4, 4, 4, 4]], expected: 2 },
    ],
    starter: String.raw`def sock_pairs(socks):
    # Hint: count each colour, then add count // 2 for every colour.
    pass


print(sock_pairs([10, 20, 20, 10, 10, 30, 50, 10, 20]))
`,
    solution: String.raw`def sock_pairs(socks):
    count = {}
    for colour in socks:
        count[colour] = count.get(colour, 0) + 1
    pairs = 0
    for colour in count:
        pairs += count[colour] // 2
    return pairs


print(sock_pairs([10, 20, 20, 10, 10, 30, 50, 10, 20]))
`,
  },
  {
    id: "group-anagrams",
    title: "Group Anagrams",
    pattern: "frequency-counting",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 49", url: LC("group-anagrams") }],
    desc: "Group the words that are anagrams of each other (same letters, any order). Return the groups in any order.",
    examples: [{ input: 'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]', output: '[["eat","tea","ate"], ["tan","nat"], ["bat"]]' }],
    fn: "group_anagrams",
    compare: "nested_unordered",
    tests: [
      { args: [["eat", "tea", "tan", "ate", "nat", "bat"]], expected: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]] },
      { args: [[""]], expected: [[""]] },
      { args: [["a"]], expected: [["a"]] },
      { args: [["abc", "cba", "bca", "xyz"]], expected: [["abc", "cba", "bca"], ["xyz"]] },
    ],
    starter: String.raw`def group_anagrams(strs):
    # Hint: anagrams share the same sorted letters; use that as a dict key.
    pass


print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
`,
    solution: String.raw`def group_anagrams(strs):
    groups = {}
    for word in strs:
        key = "".join(sorted(word))
        groups.setdefault(key, []).append(word)
    return list(groups.values())


print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
`,
  },

  // ------------------------------------------------------------ 5. Matrix Traversal
  {
    id: "diagonal-difference",
    title: "Diagonal Difference",
    pattern: "matrix-traversal",
    difficulty: "Easy",
    sources: [{ site: "HackerRank", url: HR("diagonal-difference") }],
    desc: "For a square matrix, add up the main diagonal (top-left to bottom-right) and the anti-diagonal (top-right to bottom-left). Return the absolute difference of the two sums.",
    examples: [{ input: "matrix = [[11, 2, 4], [4, 5, 6], [10, 8, -12]]", output: "15  (|4 - 19|)" }],
    fn: "diagonal_difference",
    tests: [
      { args: [[[11, 2, 4], [4, 5, 6], [10, 8, -12]]], expected: 15 },
      { args: [[[1, 2, 3], [4, 5, 6], [9, 8, 9]]], expected: 2 },
      { args: [[[5]]], expected: 0 },
      { args: [[[1, 2], [3, 4]]], expected: 0 },
    ],
    starter: String.raw`def diagonal_difference(matrix):
    # Hint: row i touches the main diagonal at column i
    # and the anti-diagonal at column n - 1 - i.
    pass


print(diagonal_difference([[11, 2, 4], [4, 5, 6], [10, 8, -12]]))
`,
    solution: String.raw`def diagonal_difference(matrix):
    n = len(matrix)
    main = anti = 0
    for i in range(n):
        main += matrix[i][i]
        anti += matrix[i][n - 1 - i]
    return abs(main - anti)


print(diagonal_difference([[11, 2, 4], [4, 5, 6], [10, 8, -12]]))
`,
  },
  {
    id: "spiral-matrix",
    title: "Spiral Matrix",
    pattern: "matrix-traversal",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 54", url: LC("spiral-matrix") }],
    desc: "Return all elements of an m × n matrix in clockwise spiral order, starting at the top-left corner.",
    examples: [{ input: "matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]", output: "[1, 2, 3, 6, 9, 8, 7, 4, 5]" }],
    fn: "spiral_order",
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      { args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], expected: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
      { args: [[[7]]], expected: [7] },
      { args: [[[1], [2], [3]]], expected: [1, 2, 3] },
      { args: [[[1, 2, 3]]], expected: [1, 2, 3] },
    ],
    starter: String.raw`def spiral_order(matrix):
    # Hint: walk with (r, c) and a direction; turn right at walls or visited cells.
    pass


print(spiral_order([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))
`,
    solution: String.raw`def spiral_order(matrix):
    rows, cols = len(matrix), len(matrix[0])
    seen = [[False] * cols for _ in range(rows)]
    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    out = []
    r = c = d = 0
    for _ in range(rows * cols):
        out.append(matrix[r][c])
        seen[r][c] = True
        nr, nc = r + dirs[d][0], c + dirs[d][1]
        if not (0 <= nr < rows and 0 <= nc < cols) or seen[nr][nc]:
            d = (d + 1) % 4
            nr, nc = r + dirs[d][0], c + dirs[d][1]
        r, c = nr, nc
    return out


print(spiral_order([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))
`,
  },

  // ------------------------------------------------------------ 6. Monotonic Stack
  {
    id: "valid-parentheses",
    title: "Valid Parentheses / Balanced Brackets",
    pattern: "monotonic-stack",
    difficulty: "Easy",
    sources: [
      { site: "LeetCode 20", url: LC("valid-parentheses") },
      { site: "HackerRank", url: HR("balanced-brackets") },
    ],
    desc: "The string holds only the characters ()[]{}. Return True if every opening bracket is closed by the same type of bracket, in the correct order.",
    examples: [
      { input: 's = "([]{})"', output: "True" },
      { input: 's = "([)]"', output: "False" },
    ],
    fn: "is_valid",
    tests: [
      { args: ["()"], expected: true },
      { args: ["()[]{}"], expected: true },
      { args: ["(]"], expected: false },
      { args: ["([)]"], expected: false },
      { args: ["{[]}"], expected: true },
      { args: ["(("], expected: false },
      { args: ["]"], expected: false },
    ],
    starter: String.raw`def is_valid(s):
    # Hint: push opening brackets on a stack; a closing one must match the top.
    pass


print(is_valid("([]{})"))
`,
    solution: String.raw`def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack


print(is_valid("([]{})"))
`,
  },
  {
    id: "daily-temperatures",
    title: "Daily Temperatures",
    pattern: "monotonic-stack",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 739", url: LC("daily-temperatures") }],
    desc: "For each day, return how many days you must wait for a warmer temperature. Use 0 if no warmer day comes.",
    examples: [{ input: "temps = [73, 74, 75, 71, 69, 72, 76, 73]", output: "[1, 1, 4, 2, 1, 1, 0, 0]" }],
    fn: "daily_temperatures",
    tests: [
      { args: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
      { args: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
      { args: [[30, 60, 90]], expected: [1, 1, 0] },
      { args: [[90, 80, 70]], expected: [0, 0, 0] },
    ],
    starter: String.raw`def daily_temperatures(temps):
    # Hint: keep a stack of day indices still waiting for a warmer day.
    pass


print(daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]))
`,
    solution: String.raw`def daily_temperatures(temps):
    answer = [0] * len(temps)
    stack = []                     # indices of days still waiting
    for i in range(len(temps)):
        while stack and temps[stack[-1]] < temps[i]:
            j = stack.pop()
            answer[j] = i - j
        stack.append(i)
    return answer


print(daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]))
`,
  },

  // ------------------------------------------------------------ 7. Prefix Sum
  {
    id: "running-sum",
    title: "Running Sum of 1d Array",
    pattern: "prefix-sum",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 1480", url: LC("running-sum-of-1d-array") }],
    desc: "Return a list where item i is the sum of nums[0] through nums[i].",
    examples: [{ input: "nums = [1, 2, 3, 4]", output: "[1, 3, 6, 10]" }],
    fn: "running_sum",
    tests: [
      { args: [[1, 2, 3, 4]], expected: [1, 3, 6, 10] },
      { args: [[1, 1, 1, 1, 1]], expected: [1, 2, 3, 4, 5] },
      { args: [[3, 1, 2, 10, 1]], expected: [3, 4, 6, 16, 17] },
      { args: [[-5]], expected: [-5] },
    ],
    starter: String.raw`def running_sum(nums):
    # Hint: each item is the previous total plus nums[i].
    pass


print(running_sum([1, 2, 3, 4]))
`,
    solution: String.raw`def running_sum(nums):
    prefix = [0] * len(nums)
    total = 0
    for i in range(len(nums)):
        total += nums[i]
        prefix[i] = total
    return prefix


print(running_sum([1, 2, 3, 4]))
`,
  },
  {
    id: "subarray-sum-equals-k",
    title: "Subarray Sum Equals K",
    pattern: "prefix-sum",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 560", url: LC("subarray-sum-equals-k") }],
    desc: "Count the contiguous subarrays whose elements add up to exactly k. The numbers may be negative.",
    examples: [
      { input: "nums = [1, 1, 1], k = 2", output: "2" },
      { input: "nums = [1, 2, 3], k = 3", output: "2" },
    ],
    fn: "subarray_sum",
    tests: [
      { args: [[1, 1, 1], 2], expected: 2 },
      { args: [[1, 2, 3], 3], expected: 2 },
      { args: [[1, -1, 0], 0], expected: 3 },
      { args: [[3, 4, 7, 2, -3, 1, 4, 2], 7], expected: 4 },
      { args: [[1], 0], expected: 0 },
    ],
    starter: String.raw`def subarray_sum(nums, k):
    # Hint: sum(i..j) = prefix[j] - prefix[i-1]. Count how often each prefix
    # total has appeared, and look up total - k at every step.
    pass


print(subarray_sum([1, 1, 1], 2))
`,
    solution: String.raw`def subarray_sum(nums, k):
    seen_count = {0: 1}        # prefix total -> how many times seen
    total = 0
    answer = 0
    for i in range(len(nums)):
        total += nums[i]
        answer += seen_count.get(total - k, 0)
        seen_count[total] = seen_count.get(total, 0) + 1
    return answer


print(subarray_sum([1, 2, 3], 3))
`,
  },

  // ------------------------------------------------------------ 8. Overlapping Intervals
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    pattern: "overlapping-intervals",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 56", url: LC("merge-intervals") }],
    desc: "Merge every group of overlapping intervals and return the result sorted by start. Intervals that only touch, like [1,4] and [4,5], also merge.",
    examples: [{ input: "intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]", output: "[[1, 6], [8, 10], [15, 18]]" }],
    fn: "merge",
    tests: [
      { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { args: [[[1, 4], [0, 4]]], expected: [[0, 4]] },
      { args: [[[1, 4], [2, 3]]], expected: [[1, 4]] },
      { args: [[[5, 6], [1, 2]]], expected: [[1, 2], [5, 6]] },
    ],
    starter: String.raw`def merge(intervals):
    # Hint: sort by start, then extend the last merged interval or start a new one.
    pass


print(merge([[1, 3], [2, 6], [8, 10], [15, 18]]))
`,
    solution: String.raw`def merge(intervals):
    intervals.sort()
    merged = []
    for start, end in intervals:
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged


print(merge([[1, 3], [2, 6], [8, 10], [15, 18]]))
`,
  },
  {
    id: "non-overlapping-intervals",
    title: "Non-overlapping Intervals",
    pattern: "overlapping-intervals",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 435", url: LC("non-overlapping-intervals") }],
    desc: "Return the fewest intervals you must remove so that none of the rest overlap. Intervals that only touch, like [1,2] and [2,3], do not overlap.",
    examples: [{ input: "intervals = [[1, 2], [2, 3], [3, 4], [1, 3]]", output: "1  (remove [1, 3])" }],
    fn: "erase_overlap_intervals",
    tests: [
      { args: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expected: 1 },
      { args: [[[1, 2], [1, 2], [1, 2]]], expected: 2 },
      { args: [[[1, 2], [2, 3]]], expected: 0 },
      { args: [[[1, 100], [11, 22], [1, 11], [2, 12]]], expected: 2 },
    ],
    starter: String.raw`def erase_overlap_intervals(intervals):
    # Hint: sort by END and greedily keep the interval that finishes first.
    pass


print(erase_overlap_intervals([[1, 2], [2, 3], [3, 4], [1, 3]]))
`,
    solution: String.raw`def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda iv: iv[1])
    removed = 0
    end = float("-inf")
    for start, finish in intervals:
        if start >= end:
            end = finish          # keep it
        else:
            removed += 1          # overlaps the one we kept
    return removed


print(erase_overlap_intervals([[1, 2], [2, 3], [3, 4], [1, 3]]))
`,
  },

  // ------------------------------------------------------------ 9. Greedy
  {
    id: "mini-max-sum",
    title: "Mini-Max Sum",
    pattern: "greedy",
    difficulty: "Easy",
    sources: [{ site: "HackerRank", url: HR("mini-max-sum") }],
    desc: "Given five positive integers, find the smallest and the largest sum you can make by adding exactly four of them. Return [min_sum, max_sum].",
    examples: [{ input: "arr = [1, 2, 3, 4, 5]", output: "[10, 14]" }],
    fn: "mini_max_sum",
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: [10, 14] },
      { args: [[7, 69, 2, 221, 8974]], expected: [299, 9271] },
      { args: [[5, 5, 5, 5, 5]], expected: [20, 20] },
    ],
    starter: String.raw`def mini_max_sum(arr):
    # Hint: leaving out the largest gives the min sum; leaving out the smallest gives the max.
    pass


print(mini_max_sum([1, 2, 3, 4, 5]))
`,
    solution: String.raw`def mini_max_sum(arr):
    total = sum(arr)
    return [total - max(arr), total - min(arr)]


print(mini_max_sum([1, 2, 3, 4, 5]))
`,
  },
  {
    id: "jump-game",
    title: "Jump Game",
    pattern: "greedy",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 55", url: LC("jump-game") }],
    desc: "You start at index 0. nums[i] is the longest jump you can make from index i. Return True if you can reach the last index.",
    examples: [
      { input: "nums = [2, 3, 1, 1, 4]", output: "True" },
      { input: "nums = [3, 2, 1, 0, 4]", output: "False" },
    ],
    fn: "can_jump",
    tests: [
      { args: [[2, 3, 1, 1, 4]], expected: true },
      { args: [[3, 2, 1, 0, 4]], expected: false },
      { args: [[0]], expected: true },
      { args: [[2, 0, 0]], expected: true },
      { args: [[1, 0, 1, 0]], expected: false },
    ],
    starter: String.raw`def can_jump(nums):
    # Hint: track the farthest index reachable so far.
    pass


print(can_jump([2, 3, 1, 1, 4]))
`,
    solution: String.raw`def can_jump(nums):
    farthest = 0
    for i in range(len(nums)):
        if i > farthest:
            return False          # stuck before reaching i
        farthest = max(farthest, i + nums[i])
    return True


print(can_jump([2, 3, 1, 1, 4]))
`,
  },

  // ------------------------------------------------------------ 10. Top K Elements
  {
    id: "kth-largest-element",
    title: "Kth Largest Element in an Array",
    pattern: "top-k",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 215", url: LC("kth-largest-element-in-an-array") }],
    desc: "Return the k-th largest element of nums, counting duplicates (in sorted order, not the k-th distinct value).",
    examples: [{ input: "nums = [3, 2, 1, 5, 6, 4], k = 2", output: "5" }],
    fn: "find_kth_largest",
    tests: [
      { args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
      { args: [[1], 1], expected: 1 },
      { args: [[7, 7, 7], 2], expected: 7 },
    ],
    starter: String.raw`import heapq


def find_kth_largest(nums, k):
    # Hint: keep a min-heap of size k; its root is the answer.
    pass


print(find_kth_largest([3, 2, 1, 5, 6, 4], 2))
`,
    solution: String.raw`import heapq


def find_kth_largest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]


print(find_kth_largest([3, 2, 1, 5, 6, 4], 2))
`,
  },
  {
    id: "top-k-frequent-elements",
    title: "Top K Frequent Elements",
    pattern: "top-k",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 347", url: LC("top-k-frequent-elements") }],
    desc: "Return the k values that appear most often in nums, in any order. The answer is guaranteed to be unique.",
    examples: [{ input: "nums = [1, 1, 1, 2, 2, 3], k = 2", output: "[1, 2]" }],
    fn: "top_k_frequent",
    compare: "unordered",
    tests: [
      { args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
      { args: [[1], 1], expected: [1] },
      { args: [[4, 4, 5, 5, 5, 6, 6, 6, 6], 2], expected: [5, 6] },
      { args: [[-1, -1, 2], 1], expected: [-1] },
    ],
    starter: String.raw`import heapq


def top_k_frequent(nums, k):
    # Hint: count first, then keep a min-heap of (count, value) of size k.
    pass


print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))
`,
    solution: String.raw`import heapq


def top_k_frequent(nums, k):
    count = {}
    for x in nums:
        count[x] = count.get(x, 0) + 1
    heap = []                      # (count, value), smallest count on top
    for value in count:
        heapq.heappush(heap, (count[value], value))
        if len(heap) > k:
            heapq.heappop(heap)
    return [value for _, value in heap]


print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))
`,
  },

  // ------------------------------------------------------------ 11. Backtracking
  {
    id: "subsets",
    title: "Subsets",
    pattern: "backtracking",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 78", url: LC("subsets") }],
    desc: "nums holds distinct integers. Return every possible subset (the power set), in any order, without duplicates.",
    examples: [{ input: "nums = [1, 2, 3]", output: "[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]" }],
    fn: "subsets",
    compare: "nested_unordered",
    tests: [
      { args: [[1, 2, 3]], expected: [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]] },
      { args: [[0]], expected: [[], [0]] },
      { args: [[5, 9]], expected: [[], [5], [9], [5, 9]] },
    ],
    starter: String.raw`def subsets(nums):
    # Hint: choose nums[i], explore from i + 1, then un-choose it.
    pass


print(subsets([1, 2, 3]))
`,
    solution: String.raw`def subsets(nums):
    result, path = [], []

    def explore(start):
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            explore(i + 1)
            path.pop()

    explore(0)
    return result


print(subsets([1, 2, 3]))
`,
  },
  {
    id: "permutations",
    title: "Permutations",
    pattern: "backtracking",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 46", url: LC("permutations") }],
    desc: "nums holds distinct integers. Return every ordering of them, in any order.",
    examples: [{ input: "nums = [1, 2, 3]", output: "[[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]" }],
    fn: "permute",
    compare: "unordered",
    tests: [
      { args: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { args: [[0, 1]], expected: [[0, 1], [1, 0]] },
      { args: [[1]], expected: [[1]] },
    ],
    starter: String.raw`def permute(nums):
    # Hint: extend path with each unused number, recurse, then remove it again.
    pass


print(permute([1, 2, 3]))
`,
    solution: String.raw`def permute(nums):
    result, path = [], []
    used = [False] * len(nums)

    def explore():
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            explore()
            path.pop()
            used[i] = False

    explore()
    return result


print(permute([1, 2, 3]))
`,
  },

  // ------------------------------------------------------------ 12. Binary Tree Traversal
  {
    id: "maximum-depth-of-binary-tree",
    title: "Maximum Depth of Binary Tree",
    pattern: "binary-tree-traversal",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 104", url: LC("maximum-depth-of-binary-tree") }],
    desc: "Return the number of nodes on the longest path from the root down to a leaf. Tests pass the tree as a TreeNode, built from a level-order list like [3, 9, 20, None, None, 15, 7].",
    examples: [{ input: "root = [3, 9, 20, None, None, 15, 7]", output: "3" }],
    fn: "max_depth",
    argTypes: ["tree"],
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
      { args: [[1, null, 2]], expected: 2 },
      { args: [[]], expected: 0 },
      { args: [[1, 2, 3, 4, null, null, null, 5]], expected: 4 },
    ],
    starter: String.raw`class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def max_depth(root):
    # Hint: depth(node) = 1 + max(depth(left), depth(right)); an empty tree is 0.
    pass


root = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
print(max_depth(root))
`,
    solution: String.raw`class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def max_depth(root):
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))


root = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
print(max_depth(root))
`,
  },
  {
    id: "binary-tree-level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    pattern: "binary-tree-traversal",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 102", url: LC("binary-tree-level-order-traversal") }],
    desc: "Return the node values one level at a time, left to right: a list with one list per level.",
    examples: [{ input: "root = [3, 9, 20, None, None, 15, 7]", output: "[[3], [9, 20], [15, 7]]" }],
    fn: "level_order",
    argTypes: ["tree"],
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]] },
      { args: [[1]], expected: [[1]] },
      { args: [[]], expected: [] },
      { args: [[1, 2, 3, 4, 5, 6, 7]], expected: [[1], [2, 3], [4, 5, 6, 7]] },
    ],
    starter: String.raw`from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def level_order(root):
    # Hint: BFS with a queue; handle len(queue) nodes per level.
    pass


root = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
print(level_order(root))
`,
    solution: String.raw`from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def level_order(root):
    if root is None:
        return []
    levels = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(level)
    return levels


root = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
print(level_order(root))
`,
  },

  // ------------------------------------------------------------ 13. Depth-First Search
  {
    id: "number-of-islands",
    title: "Number of Islands",
    pattern: "dfs",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 200", url: LC("number-of-islands") }],
    desc: 'grid is a map of "1" (land) and "0" (water). An island is a group of land cells joined up, down, left or right. Count the islands.',
    examples: [{ input: 'grid = [["1","1","0"], ["1","0","0"], ["0","0","1"]]', output: "2" }],
    fn: "num_islands",
    tests: [
      { args: [[["1", "1", "0"], ["1", "0", "0"], ["0", "0", "1"]]], expected: 2 },
      { args: [[["1", "1", "1", "1", "0"], ["1", "1", "0", "1", "0"], ["1", "1", "0", "0", "0"], ["0", "0", "0", "0", "0"]]], expected: 1 },
      { args: [[["1", "1", "0", "0", "0"], ["1", "1", "0", "0", "0"], ["0", "0", "1", "0", "0"], ["0", "0", "0", "1", "1"]]], expected: 3 },
      { args: [[["0"]]], expected: 0 },
    ],
    starter: String.raw`def num_islands(grid):
    # Hint: for every unvisited "1", count an island and DFS to sink its cells.
    pass


grid = [
    ["1", "1", "0"],
    ["1", "0", "0"],
    ["0", "0", "1"],
]
print(num_islands(grid))
`,
    solution: String.raw`def num_islands(grid):
    rows, cols = len(grid), len(grid[0])

    def sink(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != "1":
            return
        grid[r][c] = "0"          # mark visited
        sink(r + 1, c)
        sink(r - 1, c)
        sink(r, c + 1)
        sink(r, c - 1)

    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                islands += 1
                sink(r, c)
    return islands


grid = [
    ["1", "1", "0"],
    ["1", "0", "0"],
    ["0", "0", "1"],
]
print(num_islands(grid))
`,
  },
  {
    id: "course-schedule",
    title: "Course Schedule",
    pattern: "dfs",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 207", url: LC("course-schedule") }],
    desc: "There are n courses, numbered 0 to n-1. Each pair [a, b] means you must take b before a. Return True if you can finish every course, which is possible only when the prerequisites have no cycle.",
    examples: [
      { input: "n = 2, prerequisites = [[1, 0]]", output: "True" },
      { input: "n = 2, prerequisites = [[1, 0], [0, 1]]", output: "False" },
    ],
    fn: "can_finish",
    tests: [
      { args: [2, [[1, 0]]], expected: true },
      { args: [2, [[1, 0], [0, 1]]], expected: false },
      { args: [4, [[1, 0], [2, 1], [3, 2]]], expected: true },
      { args: [3, [[0, 1], [1, 2], [2, 0]]], expected: false },
      { args: [1, []], expected: true },
    ],
    starter: String.raw`def can_finish(n, prerequisites):
    # Hint: build a graph, then DFS with three states:
    # 0 = unvisited, 1 = on the current path, 2 = done. Reaching a 1 means a cycle.
    pass


print(can_finish(2, [[1, 0]]))
`,
    solution: String.raw`def can_finish(n, prerequisites):
    graph = {c: [] for c in range(n)}
    for course, pre in prerequisites:
        graph[pre].append(course)
    state = [0] * n

    def has_cycle(node):
        if state[node] == 1:
            return True
        if state[node] == 2:
            return False
        state[node] = 1
        for nxt in graph[node]:
            if has_cycle(nxt):
                return True
        state[node] = 2
        return False

    return not any(has_cycle(c) for c in range(n))


print(can_finish(2, [[1, 0]]))
`,
  },

  // ------------------------------------------------------------ 14. Breadth-First Search
  {
    id: "rotting-oranges",
    title: "Rotting Oranges",
    pattern: "bfs",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 994", url: LC("rotting-oranges") }],
    desc: "Grid cells are 0 (empty), 1 (fresh orange) or 2 (rotten orange). Each minute, a fresh orange next to a rotten one (up, down, left or right) goes rotten. Return how many minutes pass until no fresh oranges are left, or -1 if some can never rot.",
    examples: [{ input: "grid = [[2, 1, 1], [1, 1, 0], [0, 1, 1]]", output: "4" }],
    fn: "oranges_rotting",
    tests: [
      { args: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], expected: 4 },
      { args: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], expected: -1 },
      { args: [[[0, 2]]], expected: 0 },
      { args: [[[1]]], expected: -1 },
    ],
    starter: String.raw`from collections import deque


def oranges_rotting(grid):
    # Hint: multi-source BFS. Put every rotten orange in the queue first,
    # then process one layer per minute.
    pass


print(oranges_rotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]))
`,
    solution: String.raw`from collections import deque


def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while queue and fresh:
        for _ in range(len(queue)):
            r0, c0 = queue.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                r, c = r0 + dr, c0 + dc
                if 0 <= r < rows and 0 <= c < cols and grid[r][c] == 1:
                    grid[r][c] = 2
                    fresh -= 1
                    queue.append((r, c))
        minutes += 1
    return minutes if fresh == 0 else -1


print(oranges_rotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]))
`,
  },
  {
    id: "shortest-path-in-binary-matrix",
    title: "Shortest Path in Binary Matrix",
    pattern: "bfs",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 1091", url: LC("shortest-path-in-binary-matrix") }],
    desc: "In an n × n grid of 0s (open) and 1s (blocked), find the shortest path from the top-left to the bottom-right cell. You may move in all 8 directions. Return the number of cells on the path, or -1 if there is none.",
    examples: [{ input: "grid = [[0, 0, 0], [1, 1, 0], [1, 1, 0]]", output: "4" }],
    fn: "shortest_path_binary_matrix",
    tests: [
      { args: [[[0, 1], [1, 0]]], expected: 2 },
      { args: [[[0, 0, 0], [1, 1, 0], [1, 1, 0]]], expected: 4 },
      { args: [[[1, 0, 0], [1, 1, 0], [1, 1, 0]]], expected: -1 },
      { args: [[[0]]], expected: 1 },
    ],
    starter: String.raw`from collections import deque


def shortest_path_binary_matrix(grid):
    # Hint: BFS from (0, 0); the first time you reach the corner is the shortest path.
    pass


print(shortest_path_binary_matrix([[0, 0, 0], [1, 1, 0], [1, 1, 0]]))
`,
    solution: String.raw`from collections import deque


def shortest_path_binary_matrix(grid):
    n = len(grid)
    if grid[0][0] or grid[n - 1][n - 1]:
        return -1
    dist = [[0] * n for _ in range(n)]
    dist[0][0] = 1
    queue = deque([(0, 0)])
    while queue:
        r, c = queue.popleft()
        if (r, c) == (n - 1, n - 1):
            return dist[r][c]
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0 and dist[nr][nc] == 0:
                    dist[nr][nc] = dist[r][c] + 1
                    queue.append((nr, nc))
    return -1


print(shortest_path_binary_matrix([[0, 0, 0], [1, 1, 0], [1, 1, 0]]))
`,
  },

  // ------------------------------------------------------------ 15. Dynamic Programming
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    pattern: "dynamic-programming",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 70", url: LC("climbing-stairs") }],
    desc: "You climb a staircase of n steps, taking 1 or 2 steps at a time. Return the number of different ways to reach the top.",
    examples: [
      { input: "n = 3", output: "3  (1+1+1, 1+2, 2+1)" },
      { input: "n = 5", output: "8" },
    ],
    fn: "climb_stairs",
    tests: [
      { args: [1], expected: 1 },
      { args: [2], expected: 2 },
      { args: [3], expected: 3 },
      { args: [5], expected: 8 },
      { args: [30], expected: 1346269 },
    ],
    starter: String.raw`def climb_stairs(n):
    # Hint: dp[i] = dp[i - 1] + dp[i - 2]
    pass


print(climb_stairs(5))
`,
    solution: String.raw`def climb_stairs(n):
    dp = [0] * (n + 1)
    dp[0] = 1
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]


print(climb_stairs(5))
`,
  },
  {
    id: "coin-change",
    title: "Coin Change",
    pattern: "dynamic-programming",
    difficulty: "Medium",
    sources: [{ site: "LeetCode 322", url: LC("coin-change") }],
    desc: "You have unlimited coins of each value in coins. Return the fewest coins that add up to amount, or -1 if it can't be done. Greedy fails here: with coins [1, 3, 4] and amount 6, greedy picks 4+1+1 but 3+3 is better.",
    examples: [
      { input: "coins = [1, 2, 5], amount = 11", output: "3  (5 + 5 + 1)" },
      { input: "coins = [2], amount = 3", output: "-1" },
    ],
    fn: "coin_change",
    tests: [
      { args: [[1, 2, 5], 11], expected: 3 },
      { args: [[2], 3], expected: -1 },
      { args: [[1], 0], expected: 0 },
      { args: [[1, 3, 4], 6], expected: 2 },
      { args: [[186, 419, 83, 408], 6249], expected: 20 },
    ],
    starter: String.raw`def coin_change(coins, amount):
    # Hint: dp[a] = fewest coins for amount a = 1 + min(dp[a - coin]).
    pass


print(coin_change([1, 2, 5], 11))
`,
    solution: String.raw`def coin_change(coins, amount):
    INF = amount + 1
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], dp[a - coin] + 1)
    return dp[amount] if dp[amount] != INF else -1


print(coin_change([1, 2, 5], 11))
`,
  },
  // ============================================================ extra Easy set: one per pattern
  {
    id: "squares-of-a-sorted-array",
    title: "Squares of a Sorted Array",
    pattern: "two-pointers",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 977", url: LC("squares-of-a-sorted-array") }],
    desc: "nums is sorted in ascending order and may contain negative numbers. Return the square of each number, also sorted in ascending order. Try to do it in O(n), without calling sort.",
    examples: [{ input: "nums = [-4, -1, 0, 3, 10]", output: "[0, 1, 9, 16, 100]" }],
    fn: "sorted_squares",
    tests: [
      { args: [[-4, -1, 0, 3, 10]], expected: [0, 1, 9, 16, 100] },
      { args: [[-7, -3, 2, 3, 11]], expected: [4, 9, 9, 49, 121] },
      { args: [[1]], expected: [1] },
      { args: [[-3, -2, -1]], expected: [1, 4, 9] },
    ],
    starter: String.raw`def sorted_squares(nums):
    # Hint: the biggest square is at one of the two ends. Compare nums[left]
    # and nums[right] and fill the answer from the back.
    pass


print(sorted_squares([-4, -1, 0, 3, 10]))
`,
    solution: String.raw`def sorted_squares(nums):
    result = [0] * len(nums)
    left, right = 0, len(nums) - 1
    for pos in range(len(nums) - 1, -1, -1):
        if abs(nums[left]) > abs(nums[right]):
            result[pos] = nums[left] ** 2
            left += 1
        else:
            result[pos] = nums[right] ** 2
            right -= 1
    return result


print(sorted_squares([-4, -1, 0, 3, 10]))
`,
  },
  {
    id: "maximum-average-subarray",
    title: "Maximum Average Subarray I",
    pattern: "sliding-window",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 643", url: LC("maximum-average-subarray-i") }],
    desc: "Find the contiguous subarray of exactly k numbers with the largest average, and return that average.",
    examples: [{ input: "nums = [1, 12, -5, -6, 50, 3], k = 4", output: "12.75  ((12 - 5 - 6 + 50) / 4)" }],
    fn: "find_max_average",
    tests: [
      { args: [[1, 12, -5, -6, 50, 3], 4], expected: 12.75 },
      { args: [[5], 1], expected: 5 },
      { args: [[0, 4, 0, 3, 2], 1], expected: 4 },
      { args: [[1, 2, 3, 4], 2], expected: 3.5 },
    ],
    starter: String.raw`def find_max_average(nums, k):
    # Hint: keep the sum of the current window of size k; slide it by
    # adding nums[right] and removing nums[left].
    pass


print(find_max_average([1, 12, -5, -6, 50, 3], 4))
`,
    solution: String.raw`def find_max_average(nums, k):
    window = sum(nums[:k])
    best = window
    left = 0
    for right in range(k, len(nums)):
        window += nums[right] - nums[left]
        left += 1
        best = max(best, window)
    return best / k


print(find_max_average([1, 12, -5, -6, 50, 3], 4))
`,
  },
  {
    id: "search-insert-position",
    title: "Search Insert Position",
    pattern: "binary-search",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 35", url: LC("search-insert-position") }],
    desc: "nums is sorted and has no duplicates. Return the index of target if it is there. Otherwise return the index where it would go to keep the list sorted.",
    examples: [
      { input: "nums = [1, 3, 5, 6], target = 5", output: "2" },
      { input: "nums = [1, 3, 5, 6], target = 2", output: "1" },
    ],
    fn: "search_insert",
    tests: [
      { args: [[1, 3, 5, 6], 5], expected: 2 },
      { args: [[1, 3, 5, 6], 2], expected: 1 },
      { args: [[1, 3, 5, 6], 7], expected: 4 },
      { args: [[1, 3, 5, 6], 0], expected: 0 },
      { args: [[1], 1], expected: 0 },
    ],
    starter: String.raw`def search_insert(nums, target):
    # Hint: ordinary binary search; when the loop ends, lo is the insert position.
    pass


print(search_insert([1, 3, 5, 6], 2))
`,
    solution: String.raw`def search_insert(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return lo


print(search_insert([1, 3, 5, 6], 2))
`,
  },
  {
    id: "first-unique-character",
    title: "First Unique Character in a String",
    pattern: "frequency-counting",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 387", url: LC("first-unique-character-in-a-string") }],
    desc: "Return the index of the first character that appears exactly once in the string, or -1 if every character repeats.",
    examples: [
      { input: 's = "leetcode"', output: "0" },
      { input: 's = "loveleetcode"', output: "2" },
    ],
    fn: "first_uniq_char",
    tests: [
      { args: ["leetcode"], expected: 0 },
      { args: ["loveleetcode"], expected: 2 },
      { args: ["aabb"], expected: -1 },
      { args: ["z"], expected: 0 },
    ],
    starter: String.raw`def first_uniq_char(s):
    # Hint: first count every character, then scan again for a count of 1.
    pass


print(first_uniq_char("loveleetcode"))
`,
    solution: String.raw`def first_uniq_char(s):
    count = {}
    for ch in s:
        count[ch] = count.get(ch, 0) + 1
    for i in range(len(s)):
        if count[s[i]] == 1:
            return i
    return -1


print(first_uniq_char("loveleetcode"))
`,
  },
  {
    id: "transpose-matrix",
    title: "Transpose Matrix",
    pattern: "matrix-traversal",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 867", url: LC("transpose-matrix") }],
    desc: "Return the transpose of the matrix, i.e. flip it over its main diagonal so that rows become columns. An m × n matrix becomes n × m.",
    examples: [{ input: "matrix = [[1, 2, 3], [4, 5, 6]]", output: "[[1, 4], [2, 5], [3, 6]]" }],
    fn: "transpose",
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[1, 4, 7], [2, 5, 8], [3, 6, 9]] },
      { args: [[[1, 2, 3], [4, 5, 6]]], expected: [[1, 4], [2, 5], [3, 6]] },
      { args: [[[5]]], expected: [[5]] },
      { args: [[[1], [2]]], expected: [[1, 2]] },
    ],
    starter: String.raw`def transpose(matrix):
    # Hint: build a cols x rows grid, then result[c][r] = matrix[r][c].
    pass


print(transpose([[1, 2, 3], [4, 5, 6]]))
`,
    solution: String.raw`def transpose(matrix):
    rows, cols = len(matrix), len(matrix[0])
    result = [[0] * rows for _ in range(cols)]
    for r in range(rows):
        for c in range(cols):
            result[c][r] = matrix[r][c]
    return result


print(transpose([[1, 2, 3], [4, 5, 6]]))
`,
  },
  {
    id: "next-greater-element-i",
    title: "Next Greater Element I",
    pattern: "monotonic-stack",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 496", url: LC("next-greater-element-i") }],
    desc: "nums1 is a subset of nums2, and all values are distinct. For each x in nums1, find x in nums2 and return the first number to its right that is bigger than x, or -1 if there is none.",
    examples: [{ input: "nums1 = [4, 1, 2], nums2 = [1, 3, 4, 2]", output: "[-1, 3, -1]" }],
    fn: "next_greater_element",
    tests: [
      { args: [[4, 1, 2], [1, 3, 4, 2]], expected: [-1, 3, -1] },
      { args: [[2, 4], [1, 2, 3, 4]], expected: [3, -1] },
      { args: [[1], [1]], expected: [-1] },
      { args: [[1, 3, 5], [6, 5, 4, 3, 2, 1, 7]], expected: [7, 7, 7] },
    ],
    starter: String.raw`def next_greater_element(nums1, nums2):
    # Hint: one pass over nums2 with a decreasing stack gives the next greater
    # value of every number; store them in a dict, then look up nums1.
    pass


print(next_greater_element([4, 1, 2], [1, 3, 4, 2]))
`,
    solution: String.raw`def next_greater_element(nums1, nums2):
    next_greater = {}
    stack = []
    for x in nums2:
        while stack and stack[-1] < x:
            next_greater[stack.pop()] = x
        stack.append(x)
    return [next_greater.get(x, -1) for x in nums1]


print(next_greater_element([4, 1, 2], [1, 3, 4, 2]))
`,
  },
  {
    id: "find-pivot-index",
    title: "Find Pivot Index",
    pattern: "prefix-sum",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 724", url: LC("find-pivot-index") }],
    desc: "The pivot index is where the sum of everything to its left equals the sum of everything to its right, not counting the pivot itself. Return the leftmost pivot index, or -1 if there is none.",
    examples: [{ input: "nums = [1, 7, 3, 6, 5, 6]", output: "3  (1 + 7 + 3 = 5 + 6 = 11)" }],
    fn: "pivot_index",
    tests: [
      { args: [[1, 7, 3, 6, 5, 6]], expected: 3 },
      { args: [[1, 2, 3]], expected: -1 },
      { args: [[2, 1, -1]], expected: 0 },
      { args: [[0]], expected: 0 },
    ],
    starter: String.raw`def pivot_index(nums):
    # Hint: right sum = total - left sum - nums[i]. Keep a running left sum.
    pass


print(pivot_index([1, 7, 3, 6, 5, 6]))
`,
    solution: String.raw`def pivot_index(nums):
    total = sum(nums)
    left_sum = 0
    for i in range(len(nums)):
        if left_sum == total - left_sum - nums[i]:
            return i
        left_sum += nums[i]
    return -1


print(pivot_index([1, 7, 3, 6, 5, 6]))
`,
  },
  {
    id: "meeting-rooms",
    title: "Meeting Rooms",
    pattern: "overlapping-intervals",
    difficulty: "Easy",
    sources: [
      { site: "LintCode 920", url: "https://www.lintcode.com/problem/920/" },
      { site: "LeetCode 252", url: LC("meeting-rooms") },
    ],
    desc: "Each interval [start, end] is a meeting. Return True if one person can attend all of them, meaning no two meetings overlap. A meeting may start at the same moment another one ends.",
    examples: [
      { input: "intervals = [[0, 30], [5, 10], [15, 20]]", output: "False" },
      { input: "intervals = [[7, 10], [2, 4]]", output: "True" },
    ],
    fn: "can_attend_meetings",
    tests: [
      { args: [[[0, 30], [5, 10], [15, 20]]], expected: false },
      { args: [[[7, 10], [2, 4]]], expected: true },
      { args: [[]], expected: true },
      { args: [[[1, 5], [5, 8]]], expected: true },
      { args: [[[9, 12], [1, 3], [2, 4]]], expected: false },
    ],
    starter: String.raw`def can_attend_meetings(intervals):
    # Hint: sort by start time; check each meeting against the one before it.
    pass


print(can_attend_meetings([[0, 30], [5, 10], [15, 20]]))
`,
    solution: String.raw`def can_attend_meetings(intervals):
    intervals.sort()
    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i - 1][1]:
            return False
    return True


print(can_attend_meetings([[0, 30], [5, 10], [15, 20]]))
`,
  },
  {
    id: "assign-cookies",
    title: "Assign Cookies",
    pattern: "greedy",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 455", url: LC("assign-cookies") }],
    desc: "Child i is happy with any cookie of size at least g[i]. Cookie j has size s[j], and each child gets at most one cookie. Return the largest number of happy children.",
    examples: [
      { input: "g = [1, 2, 3], s = [1, 1]", output: "1" },
      { input: "g = [1, 2], s = [1, 2, 3]", output: "2" },
    ],
    fn: "find_content_children",
    tests: [
      { args: [[1, 2, 3], [1, 1]], expected: 1 },
      { args: [[1, 2], [1, 2, 3]], expected: 2 },
      { args: [[10, 9, 8, 7], [5, 6, 7, 8]], expected: 2 },
      { args: [[1], []], expected: 0 },
    ],
    starter: String.raw`def find_content_children(g, s):
    # Hint: sort both lists; give the smallest cookie that fits to the
    # least greedy child who is still waiting.
    pass


print(find_content_children([1, 2, 3], [1, 1]))
`,
    solution: String.raw`def find_content_children(g, s):
    g.sort()
    s.sort()
    i = 0                      # next child to satisfy
    for j in range(len(s)):
        if i < len(g) and s[j] >= g[i]:
            i += 1
    return i


print(find_content_children([1, 2], [1, 2, 3]))
`,
  },
  {
    id: "last-stone-weight",
    title: "Last Stone Weight",
    pattern: "top-k",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 1046", url: LC("last-stone-weight") }],
    desc: "Each turn, smash the two heaviest stones together. Stones of equal weight both disappear. Otherwise the lighter one disappears and the heavier one loses that much weight. Return the weight of the last stone, or 0 if none is left.",
    examples: [{ input: "stones = [2, 7, 4, 1, 8, 1]", output: "1" }],
    fn: "last_stone_weight",
    tests: [
      { args: [[2, 7, 4, 1, 8, 1]], expected: 1 },
      { args: [[1]], expected: 1 },
      { args: [[3, 3]], expected: 0 },
      { args: [[10, 4, 2, 10]], expected: 2 },
    ],
    starter: String.raw`import heapq


def last_stone_weight(stones):
    # Hint: heapq is a min-heap, so store negative weights to pop the heaviest.
    pass


print(last_stone_weight([2, 7, 4, 1, 8, 1]))
`,
    solution: String.raw`import heapq


def last_stone_weight(stones):
    heap = [-w for w in stones]       # max-heap via negatives
    heapq.heapify(heap)
    while len(heap) > 1:
        a = -heapq.heappop(heap)      # heaviest
        b = -heapq.heappop(heap)      # second heaviest
        if a != b:
            heapq.heappush(heap, -(a - b))
    return -heap[0] if heap else 0


print(last_stone_weight([2, 7, 4, 1, 8, 1]))
`,
  },
  {
    id: "sum-of-all-subset-xor-totals",
    title: "Sum of All Subset XOR Totals",
    pattern: "backtracking",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 1863", url: LC("sum-of-all-subset-xor-totals") }],
    desc: "The XOR total of a list is all of its elements XORed together (0 for an empty list). Return the sum of the XOR totals of every subset of nums.",
    examples: [{ input: "nums = [1, 3]", output: "6  (0 + 1 + 3 + (1 ^ 3 = 2))" }],
    fn: "subset_xor_sum",
    tests: [
      { args: [[1, 3]], expected: 6 },
      { args: [[5, 1, 6]], expected: 28 },
      { args: [[3, 4, 5, 6, 7, 8]], expected: 480 },
      { args: [[7]], expected: 7 },
    ],
    starter: String.raw`def subset_xor_sum(nums):
    # Hint: at index i either take nums[i] (xor it in) or skip it; add up the
    # running xor when you reach the end.
    pass


print(subset_xor_sum([1, 3]))
`,
    solution: String.raw`def subset_xor_sum(nums):
    def explore(i, xor):
        if i == len(nums):
            return xor
        take = explore(i + 1, xor ^ nums[i])
        skip = explore(i + 1, xor)
        return take + skip

    return explore(0, 0)


print(subset_xor_sum([1, 3]))
`,
  },
  {
    id: "binary-tree-inorder-traversal",
    title: "Binary Tree Inorder Traversal",
    pattern: "binary-tree-traversal",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 94", url: LC("binary-tree-inorder-traversal") }],
    desc: "Return the node values in in-order: left subtree, then the node, then the right subtree. Tests pass the tree as a TreeNode built from a level-order list.",
    examples: [{ input: "root = [1, None, 2, 3]", output: "[1, 3, 2]" }],
    fn: "inorder_traversal",
    argTypes: ["tree"],
    tests: [
      { args: [[1, null, 2, 3]], expected: [1, 3, 2] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1] },
      { args: [[4, 2, 6, 1, 3, 5, 7]], expected: [1, 2, 3, 4, 5, 6, 7] },
    ],
    starter: String.raw`class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def inorder_traversal(root):
    # Hint: visit(node): visit(node.left), record node.val, visit(node.right).
    pass


root = TreeNode(1, None, TreeNode(2, TreeNode(3)))
print(inorder_traversal(root))
`,
    solution: String.raw`class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def inorder_traversal(root):
    out = []

    def visit(node):
        if node is None:
            return
        visit(node.left)
        out.append(node.val)
        visit(node.right)

    visit(root)
    return out


root = TreeNode(1, None, TreeNode(2, TreeNode(3)))
print(inorder_traversal(root))
`,
  },
  {
    id: "flood-fill",
    title: "Flood Fill",
    pattern: "dfs",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 733", url: LC("flood-fill") }],
    desc: "Starting at pixel (sr, sc), repaint that pixel and every pixel connected to it (up, down, left or right) that has the same original colour with the new color. Return the image.",
    examples: [{ input: "image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2", output: "[[2,2,2],[2,2,0],[2,0,1]]" }],
    fn: "flood_fill",
    tests: [
      { args: [[[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2], expected: [[2, 2, 2], [2, 2, 0], [2, 0, 1]] },
      { args: [[[0, 0, 0], [0, 0, 0]], 0, 0, 0], expected: [[0, 0, 0], [0, 0, 0]] },
      { args: [[[0, 0, 0], [0, 1, 1]], 1, 1, 1], expected: [[0, 0, 0], [0, 1, 1]] },
      { args: [[[1]], 0, 0, 5], expected: [[5]] },
    ],
    starter: String.raw`def flood_fill(image, sr, sc, color):
    # Hint: remember the original colour, then DFS from (sr, sc).
    # Careful: if it already equals color there is nothing to do.
    pass


print(flood_fill([[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2))
`,
    solution: String.raw`def flood_fill(image, sr, sc, color):
    rows, cols = len(image), len(image[0])
    original = image[sr][sc]
    if original == color:
        return image

    def paint(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or image[r][c] != original:
            return
        image[r][c] = color
        paint(r + 1, c)
        paint(r - 1, c)
        paint(r, c + 1)
        paint(r, c - 1)

    paint(sr, sc)
    return image


print(flood_fill([[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2))
`,
  },
  {
    id: "find-if-path-exists-in-graph",
    title: "Find if Path Exists in Graph",
    pattern: "bfs",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 1971", url: LC("find-if-path-exists-in-graph") }],
    desc: "An undirected graph has n vertices, numbered 0 to n-1, and a list of edges [u, v]. Return True if there is a path from source to destination.",
    examples: [
      { input: "n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2", output: "True" },
      { input: "n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5", output: "False" },
    ],
    fn: "valid_path",
    tests: [
      { args: [3, [[0, 1], [1, 2], [2, 0]], 0, 2], expected: true },
      { args: [6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5], expected: false },
      { args: [1, [], 0, 0], expected: true },
      { args: [4, [[0, 1], [1, 2], [2, 3]], 3, 0], expected: true },
    ],
    starter: String.raw`from collections import deque


def valid_path(n, edges, source, destination):
    # Hint: build an adjacency list, then BFS from source with a seen set.
    pass


print(valid_path(3, [[0, 1], [1, 2], [2, 0]], 0, 2))
`,
    solution: String.raw`from collections import deque


def valid_path(n, edges, source, destination):
    graph = {v: [] for v in range(n)}
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    seen = {source}
    queue = deque([source])
    while queue:
        node = queue.popleft()
        if node == destination:
            return True
        for nxt in graph[node]:
            if nxt not in seen:
                seen.add(nxt)
                queue.append(nxt)
    return False


print(valid_path(6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5))
`,
  },
  {
    id: "min-cost-climbing-stairs",
    title: "Min Cost Climbing Stairs",
    pattern: "dynamic-programming",
    difficulty: "Easy",
    sources: [{ site: "LeetCode 746", url: LC("min-cost-climbing-stairs") }],
    desc: "Stepping on stair i costs cost[i], and from there you climb 1 or 2 stairs. You may start on stair 0 or stair 1. Return the cheapest way to get past the top, which is index len(cost).",
    examples: [
      { input: "cost = [10, 15, 20]", output: "15" },
      { input: "cost = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]", output: "6" },
    ],
    fn: "min_cost_climbing_stairs",
    tests: [
      { args: [[10, 15, 20]], expected: 15 },
      { args: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], expected: 6 },
      { args: [[0, 0]], expected: 0 },
      { args: [[5, 10]], expected: 5 },
    ],
    starter: String.raw`def min_cost_climbing_stairs(cost):
    # Hint: dp[i] = cheapest cost to stand on step i
    #            = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])
    pass


print(min_cost_climbing_stairs([10, 15, 20]))
`,
    solution: String.raw`def min_cost_climbing_stairs(cost):
    n = len(cost)
    dp = [0] * (n + 1)          # dp[0] = dp[1] = 0: free to start there
    for i in range(2, n + 1):
        dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])
    return dp[n]


print(min_cost_climbing_stairs([10, 15, 20]))
`,
  },
];

if (typeof module !== "undefined") module.exports = PROBLEMS;
