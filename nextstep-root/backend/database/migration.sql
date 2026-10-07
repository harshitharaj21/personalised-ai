-- ==============================================================================
-- NextStep AI: Database Schema & Migration Script
-- Compatible with Supabase PostgreSQL (Supports RLS & Extensions)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Clean Up Existing Tables (Optional - Run if resetting)
-- ==============================================================================
-- DROP TABLE IF EXISTS schedule_adaptations CASCADE;
-- DROP TABLE IF EXISTS user_progress CASCADE;
-- DROP TABLE IF EXISTS missions CASCADE;
-- DROP TABLE IF EXISTS tracks CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ==============================================================================
-- 3. PROFILES TABLE
-- Extends Supabase auth.users with app-specific metadata
-- ==============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  daily_capacity_minutes INT DEFAULT 30 CHECK (daily_capacity_minutes >= 15 AND daily_capacity_minutes <= 180),
  current_streak INT DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TRACKS TABLE
-- Learning tracks (e.g., DSA Foundations, System Design, Full-Stack)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_missions INT DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. MISSIONS TABLE
-- Daily bite-sized learning modules belonging to a track
-- ==============================================================================
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  sequence_order INT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  estimated_minutes INT NOT NULL DEFAULT 30,
  concept_breakdown TEXT NOT NULL,
  code_snippet TEXT,
  practice_prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_track_sequence UNIQUE (track_id, sequence_order)
);

-- ==============================================================================
-- 6. USER PROGRESS TABLE
-- Tracks individual user completion, rating, and notes per mission
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED')),
  difficulty_rating TEXT CHECK (difficulty_rating IN ('EASY', 'MODERATE', 'HARD')),
  user_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_mission UNIQUE (user_id, mission_id)
);

-- ==============================================================================
-- 7. SCHEDULE ADAPTATIONS TABLE
-- Audit log of pacing adjustments made by students via Gemini AI
-- ==============================================================================
CREATE TABLE IF NOT EXISTS schedule_adaptations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason_code TEXT NOT NULL CHECK (reason_code IN ('EXAMS', 'BURNOUT', 'BUSY_WORK', 'ILLNESS', 'CUSTOM')),
  previous_capacity INT NOT NULL,
  new_capacity INT NOT NULL,
  ai_explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_missions_track ON missions(track_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_schedule_adaptations_user ON schedule_adaptations(user_id);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_adaptations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can select and update their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tracks: Anyone authenticated can read tracks
CREATE POLICY "Public read tracks" ON tracks
  FOR SELECT TO authenticated USING (true);

-- Missions: Anyone authenticated can read missions
CREATE POLICY "Public read missions" ON missions
  FOR SELECT TO authenticated USING (true);

-- User Progress: Users can manage their own progress
CREATE POLICY "Users can read own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Schedule Adaptations: Users can read and insert their own adaptations
CREATE POLICY "Users can read own adaptations" ON schedule_adaptations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own adaptations" ON schedule_adaptations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 10. SEED DATA: DSA FOUNDATIONS TRACK & 12 CORE MISSIONS
-- ==============================================================================
DO $$
DECLARE
  v_track_id UUID;
BEGIN
  -- Insert or fetch DSA Foundations Track
  INSERT INTO tracks (slug, title, description, total_missions)
  VALUES (
    'dsa-foundations',
    'DSA Foundations',
    'Master the 12 core data structures and algorithmic patterns essential for technical placement interviews.',
    12
  )
  ON CONFLICT (slug) DO UPDATE 
  SET title = EXCLUDED.title, description = EXCLUDED.description
  RETURNING id INTO v_track_id;

  -- Mission 1: Array Fundamentals & Memory Layout
  INSERT INTO missions (track_id, sequence_order, title, summary, estimated_minutes, concept_breakdown, code_snippet, practice_prompt)
  VALUES (
    v_track_id,
    1,
    'Array Fundamentals & Prefix Sums',
    'Understand contiguous memory, time-space trade-offs, and how Prefix Sums reduce O(N) range queries to O(1).',
    25,
    'Arrays store elements in contiguous memory blocks, giving O(1) random access by index. When you need frequent sum queries over arbitrary sub-arrays [L, R], recalculating each time costs O(N). By pre-calculating a prefix sum array where prefix[i] = prefix[i-1] + arr[i], any range sum is computed instantly as prefix[R] - prefix[L-1].',
    'function buildPrefixSum(arr) {
  const prefix = new Array(arr.length + 1).fill(0);
  for (let i = 0; i < arr.length; i++) {
    prefix[i + 1] = prefix[i] + arr[i];
  }
  return prefix;
}

function queryRange(prefix, L, R) {
  return prefix[R + 1] - prefix[L];
}',
    'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum (Kadane''s Algorithm / Prefix optimization).'
  )
  ON CONFLICT (track_id, sequence_order) DO UPDATE
  SET title = EXCLUDED.title, summary = EXCLUDED.summary, concept_breakdown = EXCLUDED.concept_breakdown, code_snippet = EXCLUDED.code_snippet, practice_prompt = EXCLUDED.practice_prompt;

  -- Mission 2: Two Pointer Technique
  INSERT INTO missions (track_id, sequence_order, title, summary, estimated_minutes, concept_breakdown, code_snippet, practice_prompt)
  VALUES (
    v_track_id,
    2,
    'Two Pointer Patterns',
    'Eliminate nested loops by converging left and right pointers on sorted arrays in O(N) time.',
    30,
    'The Two Pointer technique is ideal for sorted arrays or palindrome problems. Instead of checking all O(N^2) pairs with two nested loops, place one pointer at the start and one at the end. Compare elements and move the appropriate pointer inward based on whether your current sum is too small or too large.',
    'function twoSumSorted(numbers, target) {
  let left = 0, right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum < target) left++;
    else right--;
  }
  return [];
}',
    'Given an array of integers heights representing container walls, find two lines that together with the x-axis form a container containing the most water.'
  )
  ON CONFLICT (track_id, sequence_order) DO UPDATE
  SET title = EXCLUDED.title, summary = EXCLUDED.summary, concept_breakdown = EXCLUDED.concept_breakdown, code_snippet = EXCLUDED.code_snippet, practice_prompt = EXCLUDED.practice_prompt;

  -- Mission 3: Sliding Window Essentials
  INSERT INTO missions (track_id, sequence_order, title, summary, estimated_minutes, concept_breakdown, code_snippet, practice_prompt)
  VALUES (
    v_track_id,
    3,
    'Sliding Window Essentials',
    'Find contiguous subarrays/substrings meeting specific criteria using dynamic window expansion and contraction.',
    35,
    'Sliding Window transforms O(N^2) brute force into linear O(N) time. Maintain left and right window bounds. Expand right pointer to add new elements into your state. When the window condition is violated (e.g. duplicate character, sum too high), contract left pointer until validity is restored.',
    'function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let maxLen = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (seen.has(char) && seen.get(char) >= left) {
      left = seen.get(char) + 1;
    }
    seen.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}',
    'Given a string s and an integer k, return the length of the longest substring that contains at most k distinct characters.'
  )
  ON CONFLICT (track_id, sequence_order) DO UPDATE
  SET title = EXCLUDED.title, summary = EXCLUDED.summary, concept_breakdown = EXCLUDED.concept_breakdown, code_snippet = EXCLUDED.code_snippet, practice_prompt = EXCLUDED.practice_prompt;

  -- Mission 4: Fast & Slow Pointers (Floyd''s Cycle Detection)
  INSERT INTO missions (track_id, sequence_order, title, summary, estimated_minutes, concept_breakdown, code_snippet, practice_prompt)
  VALUES (
    v_track_id,
    4,
    'Linked List Cycle & Tortoise-Hare',
    'Traverse linked structures at different speeds to detect cycles and identify middle nodes with O(1) extra space.',
    30,
    'Floyd''s Tortoise and Hare algorithm moves two pointers across a linked list: slow by 1 step, fast by 2 steps. If there is a cycle, fast will inevitably lap slow and they will collide. If fast reaches null, the list is acyclic. It also finds the middle node of a list in a single pass.',
    'function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}',
    'Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return null.'
  )
  ON CONFLICT (track_id, sequence_order) DO UPDATE
  SET title = EXCLUDED.title, summary = EXCLUDED.summary, concept_breakdown = EXCLUDED.concept_breakdown, code_snippet = EXCLUDED.code_snippet, practice_prompt = EXCLUDED.practice_prompt;

  -- Mission 5: Binary Search & Answer-Space Search
  INSERT INTO missions (track_id, sequence_order, title, summary, estimated_minutes, concept_breakdown, code_snippet, practice_prompt)
  VALUES (
    v_track_id,
    5,
    'Binary Search & Monotonic Search Spaces',
    'Divide and conquer to search sorted datasets or solve optimization problems over discrete monotonic spaces in O(log N).',
    30,
    'Binary Search is not just for finding an element in a sorted list. Whenever a problem has a monotonic feasibility predicate (if X works, then X+1 works), you can binary search the answer range directly (e.g. Koko Eating Bananas, Capacity To Ship Packages within D Days).',
    'function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}',
    'Given an array of integer piles and h hours, find the minimum integer eating speed k such that all bananas can be eaten within h hours.'
  )
  ON CONFLICT (track_id, sequence_order) DO UPDATE
  SET title = EXCLUDED.title, summary = EXCLUDED.summary, concept_breakdown = EXCLUDED.concept_breakdown, code_snippet = EXCLUDED.code_snippet, practice_prompt = EXCLUDED.practice_prompt;

  -- Mission 6: Stack & Monotonic Stack
  INSERT INTO missions (track_id, sequence_order, title, summary, estimated_minutes, concept_breakdown, code_snippet, practice_prompt)
  VALUES (
    v_track_id,
    6,
    'Monotonic Stack & Next Greater Element',
    'Solve next greater/smaller element queries in linear O(N) time using strictly decreasing or increasing stacks.',
    35,
    'A monotonic stack maintains elements in sorted order. When a new element comes in, pop all elements from the stack that violate the monotonic property. Every element is pushed and popped at most once, providing a clean O(N) aggregate runtime for range-boundary calculations.',
    'function nextGreaterElements(nums) {
  const n = nums.length;
  const res = new Array(n).fill(-1);
  const stack = []; // stores indices
  for (let i = 0; i < n; i++) {
    while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
      const idx = stack.pop();
      res[idx] = nums[i];
    }
    stack.push(i);
  }
  return res;
}',
    'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining (Trapping Rain Water).'
  )
  ON CONFLICT (track_id, sequence_order) DO UPDATE
  SET title = EXCLUDED.title, summary = EXCLUDED.summary, concept_breakdown = EXCLUDED.concept_breakdown, code_snippet = EXCLUDED.code_snippet, practice_prompt = EXCLUDED.practice_prompt;

  -- Mission 7: Binary Trees & DFS Traversals
  INSERT INTO missions (track_id, sequence_order, title, summary, estimated_minutes, concept_breakdown, code_snippet, practice_prompt)
  VALUES (
    v_track_id,
    7,
    'Binary Tree Traversals (Pre, In, Post)',
    'Harness recursion and call stacks to decompose tree structures, calculate depths, and validate BST properties.',
    30,
    'Tree recursion breaks down a problem into: base case (null node), recursively solve left subtree, recursively solve right subtree, and combine the results. In-order traversal of a Binary Search Tree (BST) visits keys in strictly ascending sorted order.',
    'function maxDepth(root) {
  if (!root) return 0;
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);
  return 1 + Math.max(leftDepth, rightDepth);
}',
    'Given the root of a binary tree, determine if it is a valid binary search tree (BST).'
  )
  ON CONFLICT (track_id, sequence_order) DO UPDATE
  SET title = EXCLUDED.title, summary = EXCLUDED.summary, concept_breakdown = EXCLUDED.concept_breakdown, code_snippet = EXCLUDED.code_snippet, practice_prompt = EXCLUDED.practice_prompt;

  -- Mission 8: Breadth-First Search (BFS) & Level-Order
  INSERT INTO missions (track_id, sequence_order, title, summary, estimated_minutes, concept_breakdown, code_snippet, practice_prompt)
  VALUES (
    v_track_id,
    8,
    'Breadth-First Search & Shortest Paths',
    'Leverage FIFO queues to explore level-by-level, guaranteeing the shortest path in unweighted graphs and grid maps.',
    35,
    'BFS explores neighbors layer by layer using a Queue. Because each layer represents one unit of distance, the first time you reach a target node in an unweighted graph, you are mathematically guaranteed to have taken the shortest path.',
    'function levelOrder(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length > 0) {
    const levelSize = queue.length, currentLevel = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(currentLevel);
  }
  return result;
}',
    'Given an m x n 2D binary grid which represents a map of ''1''s (land) and ''0''s (water), return the number of islands.'
  )
  ON CONFLICT (track_id, sequence_order) DO UPDATE
  SET title = EXCLUDED.title, summary = EXCLUDED.summary, concept_breakdown = EXCLUDED.concept_breakdown, code_snippet = EXCLUDED.code_snippet, practice_prompt = EXCLUDED.practice_prompt;

  -- Mission 9: Backtracking & Combinatorial Search
  INSERT INTO missions (track_id, sequence_order, title, summary, estimated_minutes, concept_breakdown, code_snippet, practice_prompt)
  VALUES (
    v_track_id,
    9,
    'Backtracking & State Exploration',
    'Systematically construct candidates, explore decision paths, and backtrack when constraints are violated.',
    40,
    'Backtracking is a depth-first search through a decision tree. The standard template: Choose a candidate, Explore (recurse with state updated), and Un-choose (revert state for the next sibling choice). Pruning branches early dramatically reduces runtime.',
    'function subsets(nums) {
  const result = [];
  function backtrack(start, currentPath) {
    result.push([...currentPath]);
    for (let i = start; i < nums.length; i++) {
      currentPath.push(nums[i]);
      backtrack(i + 1, currentPath);
      currentPath.pop(); // backtrack
    }
  }
  backtrack(0, []);
  return result;
}',
    'Given an array of distinct integers candidates and a target integer, return a list of all unique combinations where the chosen numbers sum to target.'
  )
  ON CONFLICT (track_id, sequence_order) DO UPDATE
  SET title = EXCLUDED.title, summary = EXCLUDED.summary, concept_breakdown = EXCLUDED.concept_breakdown, code_snippet = EXCLUDED.code_snippet, practice_prompt = EXCLUDED.practice_prompt;

  -- Mission 10: Dynamic Programming - 1D Memoization & Tabulation
  INSERT INTO missions (track_id, sequence_order, title, summary, estimated_minutes, concept_breakdown, code_snippet, practice_prompt)
  VALUES (
    v_track_id,
    10,
    'Dynamic Programming: 1D Subproblems',
    'Transform exponential recursion into linear polynomial time by identifying overlapping subproblems and optimal substructure.',
    40,
    'Dynamic Programming breaks a problem into smaller identical subproblems. If you notice repeated recursive calls (like in Fibonacci or Coin Change), store answers in a table (memoization/tabulation). Always identify: 1) State definition, 2) Base cases, 3) State transition recurrence relation.',
    'function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], 1 + dp[i - coin]);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}',
    'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, adjacent houses have security systems connected. Determine the maximum amount you can rob tonight without alerting police.'
  )
  ON CONFLICT (track_id, sequence_order) DO UPDATE
  SET title = EXCLUDED.title, summary = EXCLUDED.summary, concept_breakdown = EXCLUDED.concept_breakdown, code_snippet = EXCLUDED.code_snippet, practice_prompt = EXCLUDED.practice_prompt;

  -- Mission 11: Dynamic Programming - 2D Grid & String Matching
  INSERT INTO missions (track_id, sequence_order, title, summary, estimated_minutes, concept_breakdown, code_snippet, practice_prompt)
  VALUES (
    v_track_id,
    11,
    'Dynamic Programming: 2D State Transitions',
    'Model problems over pairs of sequences or 2D matrices (Longest Common Subsequence, Edit Distance).',
    45,
    'In 2D DP, state dp[i][j] usually represents the answer considering the prefix of string A of length i and string B of length j. If characters match: dp[i][j] = 1 + dp[i-1][j-1]. If they don''t: take the best transition from inserting, deleting, or skipping.',
    'function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = 1 + dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}',
    'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2 (insert, delete, or replace a character).'
  )
  ON CONFLICT (track_id, sequence_order) DO UPDATE
  SET title = EXCLUDED.title, summary = EXCLUDED.summary, concept_breakdown = EXCLUDED.concept_breakdown, code_snippet = EXCLUDED.code_snippet, practice_prompt = EXCLUDED.practice_prompt;

  -- Mission 12: Graph Algorithms & Topological Sort
  INSERT INTO missions (track_id, sequence_order, title, summary, estimated_minutes, concept_breakdown, code_snippet, practice_prompt)
  VALUES (
    v_track_id,
    12,
    'Topological Sort & Dependency Resolution',
    'Detect cycles in directed graphs and compute valid task execution orderings using Kahn''s in-degree algorithm.',
    45,
    'Topological sorting orders vertices in a Directed Acyclic Graph (DAG) such that for every directed edge u -> v, u comes before v. Kahn''s Algorithm calculates the in-degree of all nodes, adds nodes with 0 in-degree to a queue, and processes them sequentially while decrementing neighbor in-degrees.',
    'function findOrder(numCourses, prerequisites) {
  const inDegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    inDegree[course]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  const order = [];
  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of adj[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }
  return order.length === numCourses ? order : [];
}',
    'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given a list of prerequisite pairs. Return the ordering of courses you should take to finish all courses.'
  )
  ON CONFLICT (track_id, sequence_order) DO UPDATE
  SET title = EXCLUDED.title, summary = EXCLUDED.summary, concept_breakdown = EXCLUDED.concept_breakdown, code_snippet = EXCLUDED.code_snippet, practice_prompt = EXCLUDED.practice_prompt;

END $$;

-- ==============================================================================
-- END OF MIGRATION SCRIPT
-- ==============================================================================
