import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import List from '../models/List.js';
import User from '../models/User.js';
import tmdbService from '../services/tmdb.service.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns true if userId is the owner of the list */
const isOwner = (list: any, userId: any) =>
  list.owner.toString() === userId.toString();

/** Returns true if userId is a member with 'editor' (or 'owner') role */
const isEditor = (list: any, userId: any) => {
  if (isOwner(list, userId)) return true;
  return list.members.some(
    (m: any) =>
      m.user.toString() === userId.toString() && m.role === 'editor'
  );
};

/** Returns true if userId is at least a member (any role) of the list */
const isMember = (list: any, userId: any) => {
  if (isOwner(list, userId)) return true;
  return list.members.some(
    (m: any) => m.user.toString() === userId.toString()
  );
};

// ─── List CRUD ────────────────────────────────────────────────────────────────

/**
 * @desc    Create a new personal list
 * @route   POST /api/lists
 * @access  Private
 */
export const createList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { name, description, coverImage, isCollaborative } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new ApiError(400, 'List name is required');
  }

  const list = await List.create({
    name: name.trim(),
    description: typeof description === 'string' ? description.trim() : '',
    coverImage: typeof coverImage === 'string' ? coverImage.trim() : '',
    owner: userId,
    isCollaborative: Boolean(isCollaborative),
    members: [],
    films: [],
  });

  res.status(201).json(new ApiResponse(list, 'List created successfully'));
});

/**
 * @desc    Get all lists belonging to or shared with the logged-in user
 * @route   GET /api/lists
 * @access  Private
 */
export const getMyLists = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;

  // Fetch own lists + collaborative lists where user is a member
  const lists = await List.find({
    $or: [{ owner: userId }, { 'members.user': userId }],
  })
    .populate('members.user', 'username avatar _id')
    .populate('owner', 'username avatar _id')
    .sort({ updatedAt: -1 });

  res.status(200).json(new ApiResponse(lists, 'Lists retrieved successfully'));
});

/**
 * @desc    Get a single list by ID (owner or member)
 * @route   GET /api/lists/:id
 * @access  Private
 */
export const getListById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid list ID');
  }

  const list = await List.findById(id)
    .populate('members.user', 'username avatar _id')
    .populate('owner', 'username avatar _id');

  if (!list) {
    throw new ApiError(404, 'List not found');
  }

  if (!isMember(list, userId)) {
    throw new ApiError(403, 'You do not have permission to view this list');
  }

  res.status(200).json(new ApiResponse(list, 'List retrieved successfully'));
});

/**
 * @desc    Update a list's name, description, cover image, or collaborative flag (owner only)
 * @route   PUT /api/lists/:id
 * @access  Private
 */
export const updateList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { id } = req.params;
  const { name, description, coverImage, isCollaborative } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid list ID');
  }

  const list = await List.findById(id);

  if (!list) {
    throw new ApiError(404, 'List not found');
  }

  if (!isOwner(list, userId)) {
    throw new ApiError(403, 'Only the list owner can edit list details');
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      throw new ApiError(400, 'List name cannot be empty');
    }
    list.name = name.trim();
  }

  if (description !== undefined) {
    list.description = typeof description === 'string' ? description.trim() : '';
  }

  if (coverImage !== undefined) {
    list.coverImage = typeof coverImage === 'string' ? coverImage.trim() : '';
  }

  if (isCollaborative !== undefined) {
    list.isCollaborative = Boolean(isCollaborative);
    // If turning off collaboration, clear all non-owner members
    if (!list.isCollaborative) {
      list.members = [];
    }
  }

  await list.save();

  const updated = await List.findById(list._id)
    .populate('members.user', 'username avatar _id')
    .populate('owner', 'username avatar _id');

  res.status(200).json(new ApiResponse(updated, 'List updated successfully'));
});

/**
 * @desc    Delete a list (owner only)
 * @route   DELETE /api/lists/:id
 * @access  Private
 */
export const deleteList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid list ID');
  }

  const list = await List.findById(id);

  if (!list) {
    throw new ApiError(404, 'List not found');
  }

  if (!isOwner(list, userId)) {
    throw new ApiError(403, 'Only the list owner can delete this list');
  }

  await List.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(null, 'List deleted successfully'));
});

// ─── Film Management ──────────────────────────────────────────────────────────

/**
 * @desc    Add a film to a list (owner or editor)
 * @route   POST /api/lists/:id/films
 * @access  Private
 */
export const addFilmToList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { id } = req.params;
  const { filmId, title, posterPath, year } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid list ID');
  }

  if (!filmId) {
    throw new ApiError(400, 'Film ID is required');
  }

  const list = await List.findById(id);

  if (!list) {
    throw new ApiError(404, 'List not found');
  }

  if (!isEditor(list, userId)) {
    throw new ApiError(403, 'You do not have permission to add films to this list');
  }

  const filmIdStr = String(filmId);
  const alreadyExists = list.films.some((f) => f.filmId === filmIdStr);
  if (alreadyExists) {
    throw new ApiError(400, 'Film is already in this list');
  }

  let finalTitle = title;
  let finalPoster = posterPath;
  let finalYear = year;

  // Fallback to TMDB if title or poster missing
  if (!finalTitle || !finalPoster) {
    try {
      const details = await tmdbService.getMovieDetails(filmIdStr);
      if (details) {
        finalTitle = finalTitle || details.title;
        finalPoster = finalPoster || details.poster;
        finalYear = finalYear || details.year;
      }
    } catch {
      // Non-blocking
    }
  }

  list.films.push({
    filmId: filmIdStr,
    title: finalTitle || 'Untitled',
    posterPath: finalPoster || '',
    year: finalYear ? Number(finalYear) : undefined,
    addedAt: new Date(),
    addedBy: userId,
  });

  // If list coverImage is not set, use the first film's poster
  if (!list.coverImage && finalPoster) {
    list.coverImage = finalPoster;
  }

  await list.save();

  const updated = await List.findById(list._id)
    .populate('members.user', 'username avatar _id')
    .populate('owner', 'username avatar _id');

  res.status(200).json(new ApiResponse(updated, 'Film added to list successfully'));
});

/**
 * @desc    Remove a film from a list (owner or editor)
 * @route   DELETE /api/lists/:id/films/:filmId
 * @access  Private
 */
export const removeFilmFromList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { id, filmId } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid list ID');
  }

  if (!filmId) {
    throw new ApiError(400, 'Film ID is required');
  }

  const list = await List.findById(id);

  if (!list) {
    throw new ApiError(404, 'List not found');
  }

  if (!isEditor(list, userId)) {
    throw new ApiError(403, 'You do not have permission to remove films from this list');
  }

  const initialCount = list.films.length;
  list.films = list.films.filter((f) => f.filmId !== String(filmId));

  if (list.films.length === initialCount) {
    throw new ApiError(404, 'Film not found in this list');
  }

  await list.save();

  const updated = await List.findById(list._id)
    .populate('members.user', 'username avatar _id')
    .populate('owner', 'username avatar _id');

  res.status(200).json(new ApiResponse(updated, 'Film removed from list successfully'));
});

// ─── Member Management ────────────────────────────────────────────────────────

/**
 * @desc    Get all members of a list
 * @route   GET /api/lists/:id/members
 * @access  Private (owner or member)
 */
export const getListMembers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid list ID');
  }

  const list = await List.findById(id).populate(
    'members.user',
    'username avatar _id'
  );

  if (!list) {
    throw new ApiError(404, 'List not found');
  }

  if (!isMember(list, userId)) {
    throw new ApiError(403, 'You do not have permission to view members of this list');
  }

  res.status(200).json(new ApiResponse(list.members, 'Members retrieved successfully'));
});

/**
 * @desc    Invite a user to a collaborative list (owner only)
 * @route   POST /api/lists/:id/members
 * @access  Private (owner only)
 */
export const addMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { id } = req.params;
  const { username, role = 'editor' } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid list ID');
  }

  if (!username || typeof username !== 'string') {
    throw new ApiError(400, 'Username is required');
  }

  if (!['editor', 'viewer'].includes(role)) {
    throw new ApiError(400, 'Role must be editor');
  }

  const list = await List.findById(id);

  if (!list) {
    throw new ApiError(404, 'List not found');
  }

  if (!isOwner(list, userId)) {
    throw new ApiError(403, 'Only the list owner can invite members');
  }

  if (!list.isCollaborative) {
    throw new ApiError(400, 'Enable collaboration on this list first');
  }

  // Find target user by username
  const targetUser = await User.findOne({
    username: { $regex: new RegExp(`^${username.trim()}$`, 'i') },
  }).select('_id username profilePicture');

  if (!targetUser) {
    throw new ApiError(404, `User "${username}" not found`);
  }

  // Prevent inviting yourself (owner)
  if (targetUser._id.toString() === userId.toString()) {
    throw new ApiError(400, 'You cannot invite yourself');
  }

  // Check if already a member
  const alreadyMember = list.members.some(
    (m) => m.user.toString() === targetUser._id.toString()
  );
  if (alreadyMember) {
    throw new ApiError(400, `${targetUser.username} is already a member`);
  }

  list.members.push({
    user: targetUser._id as mongoose.Types.ObjectId,
    role: role as 'editor',
    addedAt: new Date(),
  });

  await list.save();

  const updated = await List.findById(list._id)
    .populate('members.user', 'username avatar _id')
    .populate('owner', 'username avatar _id');

  res.status(200).json(new ApiResponse(updated, `${targetUser.username} added as ${role}`));
});

/**
 * @desc    Remove a member from a collaborative list (owner only, or self-removal)
 * @route   DELETE /api/lists/:id/members/:memberId
 * @access  Private
 */
export const removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { id, memberId } = req.params;

  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(memberId)) {
    throw new ApiError(400, 'Invalid ID');
  }

  const list = await List.findById(id);

  if (!list) {
    throw new ApiError(404, 'List not found');
  }

  const isSelf = memberId === userId.toString();

  // Allow owner to remove anyone, or any member to remove themselves
  if (!isOwner(list, userId) && !isSelf) {
    throw new ApiError(403, 'Only the owner can remove other members');
  }

  // Prevent removing the owner
  if (memberId === list.owner.toString()) {
    throw new ApiError(400, 'Cannot remove the list owner');
  }

  const initialCount = list.members.length;
  list.members = list.members.filter((m) => m.user.toString() !== memberId);

  if (list.members.length === initialCount) {
    throw new ApiError(404, 'Member not found in this list');
  }

  await list.save();

  const updated = await List.findById(list._id)
    .populate('members.user', 'username avatar _id')
    .populate('owner', 'username avatar _id');

  res.status(200).json(new ApiResponse(updated, 'Member removed successfully'));
});

/**
 * @desc    Search users to invite (excludes existing members)
 * @route   GET /api/lists/:id/members/search?q=username
 * @access  Private (owner only)
 */
export const searchUsersToInvite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { id } = req.params;
  const { q } = req.query;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid list ID');
  }

  if (!q || typeof q !== 'string' || q.trim().length < 1) {
    throw new ApiError(400, 'Search query is required');
  }

  const list = await List.findById(id);

  if (!list) {
    throw new ApiError(404, 'List not found');
  }

  if (!isOwner(list, userId)) {
    throw new ApiError(403, 'Only the list owner can search for members to invite');
  }

  // Existing member IDs + owner (to exclude from results)
  const excludeIds = [
    list.owner,
    ...list.members.map((m) => m.user),
  ];

  const users = await User.find({
    username: { $regex: q.trim(), $options: 'i' },
    _id: { $nin: excludeIds },
  })
    .select('_id username profilePicture')
    .limit(10);

  res.status(200).json(new ApiResponse(users, 'Users found'));
});
